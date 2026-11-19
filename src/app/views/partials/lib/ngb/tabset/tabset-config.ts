/*
 * Chep nguyen tu ng-bootstrap 5.3.1 (https://github.com/ng-bootstrap/ng-bootstrap/tree/5.3.1/src),
 * giay phep MIT, xem LICENSE trong thu muc nay. Giu ban nay de HTML va giao dien khong doi
 * (tu ban 12 ng-bootstrap bo ngb-tabset va chuyen sang markup Bootstrap 5).
 */
/* eslint-disable */
import {Injectable} from '@angular/core';

/**
 * A configuration service for the [`NgbTabset`](#/components/tabset/api#NgbTabset) component.
 *
 * You can inject this service, typically in your root component, and customize the values of its properties in
 * order to provide default values for all the tabsets used in the application.
 */
@Injectable({providedIn: 'root'})
export class NgbTabsetConfig {
  justify: 'start' | 'center' | 'end' | 'fill' | 'justified' = 'start';
  orientation: 'horizontal' | 'vertical' = 'horizontal';
  type: 'tabs' | 'pills' = 'tabs';
}
