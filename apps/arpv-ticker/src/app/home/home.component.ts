import { Component, OnInit, COMPILER_OPTIONS } from '@angular/core';
import * as R from "ramda";

// modify this route / look at WR project
import { IbAPIService } from '../../../../../libs/core-data/src/lib/IbAPI/ib-api.service';

interface Candle {
  open: number;
  low: number;
  high: number;
  close: number;
  data: number[];
}

interface Day {
  DAILY_OPEN: number;
  DAILY_LOW: number;
  DAILY_HIGH: number;
  DAILY_CLOSE?: number;
  DAILY_DATA_VECTOR?: any;
  // DAILY_DATA_VECTOR?:number[][];
}

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'ticker-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  // time unit is a second (1000 miliseconds)
  readonly TIME_UNIT:number = 1000;
  readonly TIME_INTERVAL = 5;
  day: Day;
  running: boolean = true;
  high = null;

  constructor(private ibAPIService: IbAPIService) { }

  // get teh high value of teh data feed
  // the promise type should be a custom "High" type
  getHigh() {
    // AJAX connection to IB Rest API
    return this.ibAPIService.high()
      .subscribe((result: any) => this.high = result[0][31]);

    // get mocked high value from random generator
    // the below return is automatically wrapped in a promise by JS
    // this.high = Math.random() * 10;
  }

  initDay(config:Day):void {
    this.day = {
      DAILY_OPEN: 0,
      DAILY_LOW: 0,
      DAILY_HIGH: 0,
      DAILY_CLOSE: 0,
      DAILY_DATA_VECTOR: [[0]]
    };

    if (config.DAILY_OPEN) this.day.DAILY_OPEN = config.DAILY_OPEN;
    if (config.DAILY_LOW) this.day.DAILY_LOW = config.DAILY_LOW;
    if (config.DAILY_HIGH) this.day.DAILY_HIGH = config.DAILY_HIGH;
    if (config.DAILY_DATA_VECTOR) this.day.DAILY_DATA_VECTOR = config.DAILY_DATA_VECTOR;

    // return newDay;
  }

  // TODO: change number[] to Candle[] type
  getSnapshot(seconds:number):Promise<number[]> {
    return new Promise((resolve, reject) => {
      const candle:number[] = [];
      let counter:number = 0; 

      const interval = setInterval(async () => {
        if (counter < seconds) {
          await this.getHigh();

          console.log('this->high', this.high);

          candle.push(this.high);
          counter++;
        } else {
          clearInterval(interval);
          resolve(candle);
        }
      }, this.TIME_UNIT);
    })
  }

  // gets first candle
  // sets daily open, low and high from high
  // appends first candle into daily vector
  async setDayGlobals():Promise<void> {
    const first_candle = await this.getSnapshot(this.TIME_INTERVAL);
    this.initDay({
      DAILY_OPEN: this.calcOpen(first_candle),
      DAILY_LOW: this.calcLow(first_candle),
      DAILY_HIGH: this.calcHigh(first_candle),
      DAILY_DATA_VECTOR: [first_candle]
    });
  }
  
  async run() {
    while (this.running) {
      const snapshot = await this.getSnapshot(this.TIME_INTERVAL);
      const currCandleData = {
        open: this.calcOpen(snapshot),
        low: this.calcLow(snapshot),
        high: this.calcHigh(snapshot),
        close: this.calcClose(snapshot), 
        data: [snapshot]
      }
      this.day.DAILY_DATA_VECTOR.push(currCandleData);
     
      if (currCandleData.close < this.day.DAILY_LOW) console.log("%c%s", "background:red; font-size: 30px; color: black; padding: 3px 12px", 'SELL!'); 
      if (currCandleData.close > this.day.DAILY_HIGH) console.log("%c%s", "background:green; font-size: 30px; color: black; padding: 3px 12px;", 'BUY!');
    }
  }

  async start() {
    console.log('...starting...');
    await this.setDayGlobals().catch(error => console.log(error.stack));
    const lastCandle = this.run();
    console.log('...running...');
  }

  stop() {
    this.running = false;
    console.log('...stopping on last tick...');
  }

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

  ngOnInit(): void {
    // sets daily globals
    // starts operation of candle snapshots
    
    // close = last_candle[-1]
    // print(f'Global Open: {OPEN}, Global Low: {LOW}, Global High: {HIGH}, Global Close: {CLOSE}')

    // implement insertInDB
    // insertInDB()
  }

}
