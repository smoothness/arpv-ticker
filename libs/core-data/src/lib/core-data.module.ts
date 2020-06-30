import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { IbAPIService } from './IbAPI/ib-api.service';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
  ],
  providers: [IbAPIService]
})
export class CoreDataModule {}
