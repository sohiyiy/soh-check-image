import { Component, OnInit, ViewChild } from '@angular/core';

import 'tracking/build/tracking';
import 'tracking/build/data/face';

import { EmotionService } from './services/emotion/emotion.service';

//import { JsonConvert } from "json2typescript"
//import { Agent } from 'http';

declare var tracking: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  videoNativeElement; canvasNativeElement; context;
  @ViewChild('userVideoStream') userVideoStream;
  @ViewChild('canvasToRenderUserImage') canvasToRenderUserImage;

  constructor(private _emotionService: EmotionService) { }
  public analysis: Array<object> = [];
  ngOnInit() {
    this.videoNativeElement = <HTMLVideoElement>this.userVideoStream.nativeElement;
    let constraints = {
      video: {
        width: 1280,
        height: 720
      }
    };
    navigator.mediaDevices.getUserMedia(constraints).then(stream => {
      this.videoNativeElement.srcObject = stream;
    });

    this.canvasNativeElement = <HTMLCanvasElement>this.canvasToRenderUserImage.nativeElement;
    this.context = this.canvasNativeElement.getContext('2d');

    const tracker = new tracking.ObjectTracker('face');
    tracker.setInitialScale(10);
    tracker.setStepSize(5);
    tracker.setEdgesDensity(0.1);
    tracking.track('#userVideoStream', tracker);

    tracker.on('track', event => {
      if (event.data.length > 0) {
        this.context.drawImage(this.videoNativeElement, 0, 0, this.canvasNativeElement.width, this.canvasNativeElement.height);
        this.videoNativeElement.srcObject.getVideoTracks().forEach(track => track.stop());
        let userImage = this.canvasNativeElement.toDataURL('image/jpeg', 1);
        this._emotionService.getUserEmotion(userImage).subscribe(emotionData => {
          //console.log("object: %o", emotionData);
          console.log("Test response-->" + JSON.stringify(emotionData));
          //let jsonStr: string = JSON.stringify(emotionData);
          //let jsonObj: object = JSON.parse(jsonStr);

          // Now you can map the json object to the TypeScript object automatically
          //let jsonConvert: JsonConvert = new JsonConvert();
          //let user: User = jsonConvert.deserializeObject(jsonObj, User);
          //console.log(user);  
          this.analyzeFaceDetails(emotionData);
        });
      }
    });
  }
  // Populate the analysis array from a Face API response object
  public analyzeFaceDetails(response: object): void {
    // Clear analysis array.
    this.analysis = [];

    // Retrieved face attributes object from response.
    let attributes = response[0]['faceAttributes'];
    console.log("attribue ->" + JSON.stringify(attributes));
    // Convert two strings into a key-value pair for our
    // analysis list.
    let getAnalysisObject: any = (feature, value) => {
      return { "feature": feature, "value": value };
    }

    // Converts 'john' into 'John'
    let capitalizeFirstLetter: any = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

    // Get age
    this.analysis.push(
      getAnalysisObject("Age", attributes['age'])
    );

    // Get age
    this.analysis.push(getAnalysisObject("Gender", capitalizeFirstLetter(attributes['gender'])));

    // Get smiling (person is smiling if value is over 0.5)
    this.analysis.push(getAnalysisObject("Smiling?", (attributes['smile'] > 0.5 ? "Yes" : "No")));

    // Check if bald, if so, output that.
    // If not, give the person's hair color.
    if (attributes['hair']['bald'] > 0.8) {
      this.analysis.push(getAnalysisObject("Is Bald?", "Yes"));
    } else if (attributes['hair']['hairColor'] && attributes['hair']['hairColor'].length > 0) {
      this.analysis.push(getAnalysisObject("Hair Color", capitalizeFirstLetter(attributes['hair']['hairColor'][0]['color'])));
    }

    // Get person's emotion by looping through emotion object and grabbing the greatest value
    let moods = attributes['emotion'];
    var greatestEmotion, greatestEmotionValue;
    for (var mood in moods) {
      if (moods[mood] && (!greatestEmotion || moods[mood] > greatestEmotionValue)) {
        greatestEmotion = mood;
        greatestEmotionValue = moods[mood];
      }
    }
    this.analysis.push(getAnalysisObject("Emotion", capitalizeFirstLetter(greatestEmotion)));

    console.log("analysis array -->" + JSON.stringify(this.analysis));
  }
}

