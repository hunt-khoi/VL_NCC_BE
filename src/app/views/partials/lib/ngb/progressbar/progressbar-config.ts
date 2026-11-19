/*
 * Chep nguyen tu ng-bootstrap 5.3.1 (https://github.com/ng-bootstrap/ng-bootstrap/tree/5.3.1/src),
 * giay phep MIT, xem LICENSE trong thu muc nay. Giu ban nay de HTML va giao dien khong doi
 * (tu ban 12 ng-bootstrap bo ngb-tabset va chuyen sang markup Bootstrap 5).
 */
/* eslint-disable */
import {Injectable} from '@angular/core';

/**
 * A configuration service for the [`NgbProgressbar`](#/components/progressbar/api#NgbProgressbar) component.
 *
 * You can inject this service, typically in your root component, and customize the values of its properties in
 * order to provide default values for all the progress bars used in the application.
 */
@Injectable({providedIn: 'root'})
export class NgbProgressbarConfig {
  max = 100;
  animated = false;
  striped = false;
  textType: string;
  type: string;
  showValue = false;
  height: string;
}
