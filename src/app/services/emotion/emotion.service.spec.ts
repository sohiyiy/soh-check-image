import { TestBed } from '@angular/core/testing';

import { EmotionService } from './emotion.service';

describe('EmotionService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: EmotionService = TestBed.get(EmotionService);
    expect(service).toBeTruthy();
  });
});
