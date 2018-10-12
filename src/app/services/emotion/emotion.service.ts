import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { environment } from './../../../environments/environment.prod';
import { shouldCallLifecycleInitHook } from '../../../../node_modules/@angular/core/src/view';

@Injectable()
export class EmotionService {

   //apiUrl: string = 'https://westcentralus.api.cognitive.microsoft.com/emotion/v1.0/recognize?';
  apiUrl: string = 'https://westcentralus.api.cognitive.microsoft.com/face/v1.0/detect?';
  imageUrl: string = 'https://d388k12zmpy88.cloudfront.net/ideatoappster/wp-content/uploads/2013/09/Google-Glass-image-modified1.jpg';
  faceAttributes: string = 'age,gender,headPose,smile,facialHair,glasses,emotion,hair,makeup,occlusion,accessories,blur,exposure,noise';

  constructor(private http: HttpClient) {}

  getUserEmotion(userImageBlob) {
    let headers = new HttpHeaders();
    let httpParams = new HttpParams();

    headers = headers.set('Ocp-Apim-Subscription-Key', environment.apiKeys.emotion);
    console.log("Api Key " + environment.apiKeys.emotion);
    headers = headers.set('Content-Type', 'application/octet-stream');
    //headers = headers.set('Content-Type', 'ocp-apim-subscription-key');
    //headers = headers.set('Content-Type', 'application/json');
    
    httpParams = httpParams.append('returnFaceId', 'true');
    httpParams = httpParams.append('returnFaceLandmarks', 'false');
    httpParams = httpParams.append('returnFaceAttributes', 'age,gender,headPose,smile,facialHair,glasses,emotion,hair,makeup,occlusion,accessories,blur,exposure,noise');
   // headers = headers.set('returnEmotions', 'true');
        //return this.http.post(this.apiUrl, '{"url":"' + userImageBlob+'"}', { headers: headers } )
    //return this.http.post(this.apiUrl, '{"url":"' + this.imageUrl+'"}', { headers: headers } )
    
    return this.http.post(this.apiUrl, this.makeBlob(userImageBlob), { headers: headers, params: httpParams});
  }

  

  makeBlob(dataURL) {
    var BASE64_MARKER = ';base64,';
    if (dataURL.indexOf(BASE64_MARKER) == -1) {
      var parts = dataURL.split(',');
      var contentType = parts[0].split(':')[1];
      var raw = decodeURIComponent(parts[1]);
      return new Blob([raw], { type: contentType });
    }
    var parts = dataURL.split(BASE64_MARKER);
    var contentType = parts[0].split(':')[1];
    var raw = window.atob(parts[1]);
    var rawLength = raw.length;

    var uInt8Array = new Uint8Array(rawLength);

    for (var i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], { type: contentType });
  }

}
