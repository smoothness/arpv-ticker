import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as R from 'ramda';

import { MarketDataService, IbAPIService, Day, Candle } from '@arpv/core-data';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'ticker-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  @ViewChild('candleContainer', {read: ElementRef}) candleContainer: ElementRef;

  // time unit is a second (1000 miliseconds)
  readonly TIME_UNIT:number = 3000;
  TIME_INTERVAL = 5;
  price: number;
  day: Day;
  running: boolean = true;
  high: number;
  lastSnapshot: number[];
  isOrderPlaced: boolean = false;
  orderPrice: number;
  orderType: string;
  stopLimit: number;
  orderContracts: number = 12;
  liquidateState: boolean = false;

  constructor(
    private mds: MarketDataService,
    private ibAPIService: IbAPIService
  ) { }

  // UI state
  UIservice(type: string) {
    console.log('calls UI service with type: ', type);
    if(type === 'buy') {
      this.candleContainer.nativeElement.classList.add('buy');
    }
    if(type === 'buy') {
      this.candleContainer.nativeElement.classList.add('sell');
    }
    // console.log(this.candleContainer.nativeElement.textContent);
  }

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
      DAILY_RANGE: 0,
      DAILY_DATA_VECTOR: [[0]]
    };

    if(config.DAILY_OPEN) this.day.DAILY_OPEN = config.DAILY_OPEN;
    if(config.DAILY_LOW) this.day.DAILY_LOW = config.DAILY_LOW;
    if(config.DAILY_HIGH) this.day.DAILY_HIGH = config.DAILY_HIGH;
    if(config.DAILY_RANGE) this.day.DAILY_RANGE = config.DAILY_RANGE;
    if(config.DAILY_DATA_VECTOR) this.day.DAILY_DATA_VECTOR = config.DAILY_DATA_VECTOR;
  }

  // TODO: change number[] to Candle[] type
  getSnapshot(seconds:number):Promise<number[]> {
    return new Promise((resolve, reject) => {
      const candle:number[] = [];
      let counter:number = 0; 

      const interval = setInterval(async () => {
        // documentation tells that setInterval() does not play nice with Promises/Observables
        if(counter < seconds) {
          this.getHigh();

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
    const first_candle = await this.getSnapshot(5);
    this.initDay({
      DAILY_OPEN: this.mds.calcOpen(first_candle),
      DAILY_LOW: this.mds.calcLow(first_candle),
      DAILY_HIGH: this.mds.calcHigh(first_candle),
      DAILY_RANGE: this.mds.calcRange(this.mds.calcHigh(first_candle), this.mds.calcLow(first_candle)),
      DAILY_DATA_VECTOR: [first_candle]
    });
  }
  
  async run() {
    while (this.running) {
      const snapshot = await this.getSnapshot(1);
      this.lastSnapshot = snapshot;
      const currCandleData = {
        open: this.mds.calcOpen(snapshot),
        low: this.mds.calcLow(snapshot),
        high: this.mds.calcHigh(snapshot),
        close: this.mds.calcClose(snapshot), 
        data: [snapshot]
      }

      this.day.DAILY_DATA_VECTOR.push(currCandleData);

      // first sell condition
      if(!this.isOrderPlaced) {
        this.firstPipe(currCandleData);
      } else {
        this.recurrentPipe(currCandleData);
      }
    }
  }

  firstPipe(candle: Candle) {
    if(candle.close > this.day.DAILY_HIGH) {
      this.createFirstOrder(candle.high, 'buy');
    }
    if(candle.close < this.day.DAILY_LOW) {
      this.createFirstOrder(candle.high, 'sell');
    }
  }

  recurrentPipe(candle: Candle) {
    if(this.orderType === 'buy') {
      this.recurrentBuyPipe(candle.high);
    } else if(this.orderType === 'sell') {
      this.recurrentSellPipe(candle.high);
    } else console.log('%c%s', 'background:green; font-size: 30px; color: black; padding: 3px 12px;','Into recurrent order creation but not order type defined!');
  }

  recurrentBuyPipe(price: number) {
    if(price <= this.stopLimit) {
      console.log('Reached lowest price, SELL EVERYTHING!');
      this.liquidateState = true;
      this.createRecurrentOrder(price, this.orderType)
      this.running = false;
      return false;
    }
    console.log('current candle price 1 = ', price);
    console.log('order price + range 1 = ', this.orderPrice + this.day.DAILY_RANGE);
    if(price >= (this.orderPrice + this.day.DAILY_RANGE)) {
      console.log('current candle price 2 = ', price);
      console.log('order price + range 2 = ', this.orderPrice + this.day.DAILY_RANGE);

      this.stopLimit = this.day.DAILY_HIGH;
      this.orderPrice = price;
      this.createRecurrentOrder(price, this.orderType)
    } 
  }

  recurrentSellPipe(price: number) {
    if(price >= this.stopLimit) {
      console.log('Reached highest price, BUY EVERYTHING!')
      this.liquidateState = true;
      this.createRecurrentOrder(price, this.orderType);
      this.running = false;
      return false;
    }
    if(price <= (this.orderPrice - this.day.DAILY_RANGE)) {
      this.stopLimit = this.day.DAILY_LOW;
      this.orderPrice = price;
      this.createRecurrentOrder(price, this.orderType);
    } 
  }

  createFirstOrder(price: number, type: string) {
    this.isOrderPlaced = true;
    if(type === 'buy') {
      this.stopLimit = this.day.DAILY_LOW;
      this.orderType = 'buy';
    } else if(type === 'sell') {
      this.stopLimit = this.day.DAILY_HIGH;
      this.orderType = 'sell';
    } else console.log("%c%s", "background: red; font-size: 30px; color: black; padding: 3px 12px;", `NO TYPE SET?!?!?!?!`);
    this.createMarketOrder(price, this.orderType, 'first', false);
  }

  createRecurrentOrder(price: number, type: string) {
    this.createMarketOrder(price, type, 'recurrent', this.liquidateState); 
  }

  // actually creates an order here
  createMarketOrder(price: number, type: string, message: string, liquidate: boolean) {
    console.log('execute order.');
    if(type === 'buy') {
      if(message === 'first') {
        this.orderPrice = price;
        console.log("%c%s", "background:green; font-size: 30px; color: black; padding: 3px 12px;", `${message} ${type}, Price: ${this.orderPrice}`);
        // this.UIservice(type);
        console.log('Order Price: ', this.orderPrice);
        console.log('Range: ', this.day.DAILY_RANGE);
      } 
      if(message === 'recurrent') {
        console.log("%c%s", "background:green; font-size: 30px; color: black; padding: 3px 12px;", `${message} ${type}, Price: ${this.orderPrice}`);
        if(this.orderContracts > 0) {
          if(liquidate) {
            this.orderContracts = 0;
            // market order  liquidate
          } else {
            this.orderContracts = this.orderContracts - 3;
            // market order to buy portion
            console.log('Contracts left: ', this.orderContracts);
          }
        } else {
          console.log('POSITION CLOSED!');
          return false;
        }
      } 
    } else if (type === 'sell') {
      if(message === 'first') {
        this.orderPrice = price;
        console.log("%c%s", "background:green; font-size: 30px; color: black; padding: 3px 12px;", `${message} ${type}, Price: ${this.orderPrice}`);
        // this.UIservice(type);
        console.log('Order Price: ', this.orderPrice);
        console.log('Range: ', this.day.DAILY_RANGE);
      } else if (message === 'recurrent') {
        console.log("%c%s", "background:green; font-size: 30px; color: black; padding: 3px 12px;", `${message} ${type}, Price: ${this.orderPrice}`);
        if(this.orderContracts > 0) {
          this.orderContracts = this.orderContracts - 3;
          console.log('Contracts left: ', this.orderContracts);
        } else {
          console.log('POSITION CLOSED!');
          return false;
        }
      } 
    } else console.log("%c%s", "background: red; font-size: 30px; color: black; padding: 3px 12px;", `NO TYPE SET?!?!?!?!`);
  }

  async start() {
    console.log('/********* Starting *********/');
    await this.setDayGlobals().catch(error => console.log(error.stack));

    this.run();
    console.log('/********* Running *********/');
  }
  
  stop() {
    this.running = false;
    console.log('...stopping on last tick...');
    // important*** the daily close will be the close value of the
    // last COMPLETE candle before the stop button was cliked.
    // (or the cronjob triggers the day close)
    this.day.DAILY_CLOSE = R.last(this.lastSnapshot);
    console.log('Day close: ', this.day.DAILY_CLOSE);
  }

  ngOnInit(): void {
    this.getHigh();
  //   console.log(this.candleContainer.nativeElement.textContent);
    // sets daily globals
    // starts operation of candle snapshots
    
    // close = last_candle[-1]
    // print(f'Global Open: {OPEN}, Global Low: {LOW}, Global High: {HIGH}, Global Close: {CLOSE}')

    // implement insertInDB
    // insertInDB()
  }

  // ngAfterViewInit(): void {
  //   this.getHigh();
  //   console.log(this.candleContainer.nativeElement.textContent);
  // }

}
