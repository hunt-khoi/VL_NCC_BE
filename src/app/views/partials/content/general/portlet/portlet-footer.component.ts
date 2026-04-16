import { Component, HostBinding, Input, OnInit } from '@angular/core';

@Component({
	selector: 'kt-portlet-footer',
	template: `
		<ng-content></ng-content>`
})
export class PortletFooterComponent implements OnInit {
	@HostBinding('class') classList = 'kt-portlet__foot';
	@Input() class: string;

	ngOnInit() {
		if (this.class) {
			this.classList += ' ' + this.class;
		}
	}
}