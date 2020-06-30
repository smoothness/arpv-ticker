import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// https://localhost:5000/v1/portal/iserver/marketdata/snapshot?conids=371749798&fields=31

const BASE_URL = 'https://localhost:5000/v1/portal/iserver/';

@Injectable({
  providedIn: 'root'
})
export class IbAPIService {
  model = 'marketdata/snapshot?conids=371749798&fields=31';

  constructor(private httpClient: HttpClient) { }

  high() {
    return this.httpClient.get(`${BASE_URL}${this.model}`);
  }
}
