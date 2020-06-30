import { TestBed } from '@angular/core/testing';

import { IbAPIService } from './ib-api.service';

describe('IbAPIService', () => {
  let service: IbAPIService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IbAPIService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
