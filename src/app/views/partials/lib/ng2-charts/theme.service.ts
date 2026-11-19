/*
 * Chep nguyen tu ng2-charts 2.4.3 (https://github.com/valor-software/ng2-charts/tree/v2.4.3),
 * giay phep ISC, xem LICENSE. Giu Chart.js 2.9 de bieu do khong doi giao dien;
 * ng2-charts 2.x chi co ban View Engine nen khong dung duoc tu Angular 16.
 */
/* eslint-disable */
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ChartOptions } from 'chart.js';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private pColorschemesOptions: ChartOptions = {};
  public colorschemesOptions = new BehaviorSubject<ChartOptions>({});

  constructor() { }

  setColorschemesOptions(options: ChartOptions): void {
    this.pColorschemesOptions = options;
    this.colorschemesOptions.next(options);
  }

  getColorschemesOptions(): ChartOptions {
    return this.pColorschemesOptions;
  }
}
