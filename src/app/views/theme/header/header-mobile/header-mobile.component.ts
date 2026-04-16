import { Component, OnInit } from '@angular/core';
import { LayoutConfigService, ToggleOptions } from '../../../../core/_base/layout';

@Component({
	selector: 'kt-header-mobile',
	templateUrl: './header-mobile.component.html',
})
export class HeaderMobileComponent implements OnInit {
	// Public properties
	headerLogo: string = "";
	asideDisplay: boolean = false;

	toggleOptions: ToggleOptions = {
		target: 'body',
		targetState: 'kt-header__topbar--mobile-on',
		togglerState: 'kt-header-mobile__toolbar-topbar-toggler--active'
	};

	constructor(private layoutConfigService: LayoutConfigService) { }

	ngOnInit() {
		this.headerLogo = this.layoutConfigService.getLogo();
		this.asideDisplay = this.layoutConfigService.getConfig('aside.self.display');
	}
}