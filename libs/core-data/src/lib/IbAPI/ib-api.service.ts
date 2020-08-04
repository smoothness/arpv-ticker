import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// https://localhost:5000/v1/portal/iserver/marketdata/snapshot?conids=371749798&fields=31

const BASE_URL = 'https://localhost:5000/v1/portal/iserver/';

@Injectable({
  providedIn: 'root'
})
export class IbAPIService {
  accountId = 'DF2454215';
  high_model = 'marketdata/snapshot?conids=371749798&fields=31';
  create_order_model = `account/${this.accountId}/order`;
  order_data = {
    "acctId": "DF2454215", 
    "conid": 371749798, 
    "secType": "FUT", 
    "cOID": "1234", 
    "parentId": "", 
    "orderType": "MKT", 
    "outsideRTH": true, 
    "side": "buy", 
    "ticker": "ESU20", 
    "tif": "GTC", 
    "referrer": "", 
    "quantity": 10, 
    "useAdaptive": true,
};



  constructor(private httpClient: HttpClient) { }

  high() {
    return this.httpClient.get(`${BASE_URL}${this.high_model}`);
  }

  createOrder() {
    return this.httpClient.post(`${BASE_URL}${this.create_order_model}`, this.order_data);
  }
}
