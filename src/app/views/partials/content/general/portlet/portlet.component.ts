import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { Observable } from 'rxjs';
import { PortletBodyComponent } from './portlet-body.component';
import { PortletHeaderComponent } from './portlet-header.component';
import { PortletFooterComponent } from './portlet-footer.component';

export interface PortletOptions {
	test?: any;
}

@Component({
	selector: 'kt-portlet',
	templateUrl: './portlet.component.html',
	exportAs: 'ktPortlet'
})
export class PortletComponent implements OnInit {
	@Input() loading$: Observable<boolean> | undefined;
	// portlet extra options
	@Input() options: PortletOptions | undefined;
	// portlet root classes
	@Input() class: string = "";

	@ViewChild('portlet', {static: true}) portlet: ElementRef | undefined;
	// portlet header component template
	@ViewChild(PortletHeaderComponent, {static: true}) header: PortletHeaderComponent | undefined;
	// portlet body component template
	@ViewChild(PortletBodyComponent, {static: true}) body: PortletBodyComponent | undefined;
	// portlet footer component template
	@ViewChild(PortletFooterComponent, {static: true}) footer: PortletFooterComponent | undefined;

	constructor(public loader: LoadingBarService) {
		this.loader.complete();
	}

	ngOnInit() {
	}
}