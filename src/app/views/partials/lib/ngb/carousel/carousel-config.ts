/*
 * Chep nguyen tu ng-bootstrap 5.3.1 (https://github.com/ng-bootstrap/ng-bootstrap/tree/5.3.1/src),
 * giay phep MIT, xem LICENSE trong thu muc nay. Giu ban nay de HTML va giao dien khong doi
 * (tu ban 12 ng-bootstrap bo ngb-tabset va chuyen sang markup Bootstrap 5).
 */
/* eslint-disable */
import {Injectable} from '@angular/core';

/**
 * A configuration service for the [NgbCarousel](#/components/carousel/api#NgbCarousel) component.
 *
 * You can inject this service, typically in your root component, and customize its properties
 * to provide default values for all carousels used in the application.
 */
@Injectable({providedIn: 'root'})
export class NgbCarouselConfig {
  interval = 5000;
  wrap = true;
  keyboard = true;
  pauseOnHover = true;
  showNavigationArrows = true;
  showNavigationIndicators = true;
}
