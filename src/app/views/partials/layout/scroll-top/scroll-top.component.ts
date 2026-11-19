import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ScrollTopOptions } from '../../../../core/_base/layout';

@Component({
    selector: 'kt-scroll-top',
    templateUrl: './scroll-top.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ScrollTopComponent {
	scrollTopOptions: ScrollTopOptions = {
		offset: 300,
		speed: 600
	};
}