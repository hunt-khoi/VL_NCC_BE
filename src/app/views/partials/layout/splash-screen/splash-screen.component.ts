import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import objectPath from 'object-path';
import { LayoutConfigService, SplashScreenService } from '../../../../core/_base/layout';

@Component({
	selector: 'kt-splash-screen',
	templateUrl: './splash-screen.component.html',
	styleUrls: ['./splash-screen.component.scss']
})
export class SplashScreenComponent implements OnInit {
	// Public proprties
	loaderLogo: string = "";
	loaderType: string = "";
	loaderMessage: string = "";
	@ViewChild('splashScreen', {static: true}) splashScreen: ElementRef | undefined;

	constructor(
		private layoutConfigService: LayoutConfigService,
		private splashScreenService: SplashScreenService) {
	}

	ngOnInit() {
		// init splash screen, see loader option in layout.config.ts
		const loaderConfig = this.layoutConfigService.getConfig('loader');
		this.loaderLogo = objectPath.get(loaderConfig, 'logo');
		this.loaderType = objectPath.get(loaderConfig, 'type');
		this.loaderMessage = objectPath.get(loaderConfig, 'message');
		if (this.splashScreen) 
			this.splashScreenService.init(this.splashScreen);
	}
}