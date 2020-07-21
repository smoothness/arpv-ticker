import { Injectable } from '@angular/core';
import * as R from "ramda";

@Injectable({
  providedIn: 'root'
})
export class MarketDataService {

  constructor() { }

  // executeMarketOrder(high:number, type: string, message: string, liquidate: boolean) {
  //   console.log('Execute Market Order.');
  //   if(type === 'buy') {
  //     if(message === 'first') {
  //       this.orderPrice = high;
  //       this.UIservice(type);
  //       console.log('Order Price: ', this.orderPrice);
  //       // execute buy order through API
  //       console.log("%c%s", "background:green; font-size: 30px; color: black; padding: 3px 12px;", `${message} ${type}`);
  //     } 
  //     if(message === 'recurrent') {
  //       if(this.orderContracts > 0) {
  //         if(liquidate) {
  //           this.orderContracts = 0;
  //           // market order to liquidate
  //         } else {
  //           this.orderContracts = this.orderContracts - 3;
  //           // market order to buy portion
  //           console.log('Contracts left: ', this.orderContracts);
  //         }
  //       } else {
  //         console.log('POSITION CLOSED!');
  //         return false;
  //       }
  //       // execute buy order through API
  //       console.log("%c%s", "background:green; font-size: 30px; color: black; padding: 3px 12px;", `${message} ${type}`);
  //     } 
  //   }

  //   if(type === 'sell') {
  //     if(message === 'first') {
  //       this.orderPrice = high;
  //       console.log('Order Price: ', this.orderPrice);
  //       // execute sell order through API
  //       console.log("%c%s", "background:green; font-size: 30px; color: black; padding: 3px 12px;", `${message} ${type}`);
  //     } 
      
  //     if(message === 'recurrent') {
  //       if(this.orderContracts > 0) {
  //         this.orderContracts = this.orderContracts - 3;
  //         console.log('Contracts left: ', this.orderContracts);
  //       } else {
  //         console.log('POSITION CLOSED!');
  //         return false;
  //       }
  //       // execute sell order through API
  //       console.log("%c%s", "background:green; font-size: 30px; color: black; padding: 3px 12px;", `${message} ${type}`);
  //     } 
  //   }
  // }

  calcOpen(list: number[]): number {
    return R.head(list);
  }

  calcClose(list: number[]): number {
    return R.last(list);
  }

  calcLow(list: number[]): number {
    return R.head(R.sort((a: number, b:number) => a - b, list));
    // return list.sort()[0];
  }
 
  calcHigh(list: number[]): number {
    return R.last(R.sort((a: number, b:number) => a - b, list));
    // return list.sort()[list.length - 1];
  }

  calcRange(high: number, low: number): number {
    return high - low; 
  }

}
