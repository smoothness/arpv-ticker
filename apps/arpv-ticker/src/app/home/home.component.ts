import { Component, OnInit } from '@angular/core';

interface Candle {
  open:number;
  low:number;
  high:number;
  close:number;
  data:number[];
}

interface Day {
  DAILY_OPEN:number;
  DAILY_LOW:number;
  DAILY_HIGH:number;
  DAILY_CLOSE?:number;
  DAILY_DATA_VECTOR?:number[][];
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
  readonly TIME_INTERVAL = 30;
  day:Day;
  running:boolean = true;

  constructor() { }

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

  // get teh high value of teh data feed
  // the promise type should be a custom "High" type
  async getHigh():Promise<number> {
    // get mocked high value from random generator
    // the below return is automatically wrapped in a promise by JS
    return Math.random() * 10;

    // implement AJAX connection to IB Rest API
  }

  // TODO: change number[] to Candle[] type
  getSnapshot(seconds:number):Promise<number[]> {
    return new Promise((resolve, reject) => {
      const first_candle:number[] = [];
      let counter:number = 0; 

      const interval = setInterval(async () => {
        if (counter < seconds) {
          const val:number = await this.getHigh();
          console.log('val', val)
          first_candle.push(val);
          counter++;
        } else {
          clearInterval(interval);
          resolve(first_candle);
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
      DAILY_OPEN: first_candle[0],
      DAILY_LOW: first_candle.sort()[0],
      DAILY_HIGH: first_candle.sort()[first_candle.length - 1],
      DAILY_DATA_VECTOR: [first_candle]
    });
    console.log('INIT DAY: ', this.day);
  }
  
  async run() {
    while (this.running) {
      const snapshot = await this.getSnapshot(this.TIME_INTERVAL);
      this.day.DAILY_DATA_VECTOR.push(snapshot);
      console.log('Snapshot: ', this.day);
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

  ngOnInit(): void {
    // sets daily globals
    // starts operation of candle snapshots
    
    // close = last_candle[-1]
    // print(f'Global Open: {OPEN}, Global Low: {LOW}, Global High: {HIGH}, Global Close: {CLOSE}')

    // implement insertInDB
    // insertInDB()
  }

}
