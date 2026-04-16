import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { LayoutConfigService, SplashScreenService, TranslationService } from '../../../core/_base/layout';
import { AuthNoticeService } from '../../../core/auth';

@Component({
	selector: 'kt-auth',
	templateUrl: './auth.component.html',
	styleUrls: ['./auth.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class AuthComponent implements OnInit {
	today: number = Date.now();
	headerLogo: string = "";
	Logo: string = "";

	constructor(
		private layoutConfigService: LayoutConfigService,
		public authNoticeService: AuthNoticeService,
		private translationService: TranslationService,
		private splashScreenService: SplashScreenService) {
	}

	ngOnInit(): void {
		this.translationService.setLanguage(this.translationService.getSelectedLanguage());
		this.headerLogo = this.layoutConfigService.getLogo();
		this.splashScreenService.hide();
		let constant = this.layoutConfigService.getConfig('constants');
		if (constant)
			this.Logo = constant.logo;
	}
}