import { MAT_DATE_FORMATS } from "@angular/material";
import { Directive } from '@angular/core';
import { MY_FORMATS } from "../datepicker";

@Directive({
  selector: '[monthDateFormats]',
  providers: [{ provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }],
})

export class MonthFormatDirective {}