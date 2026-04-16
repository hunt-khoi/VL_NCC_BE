import { Subscription } from 'rxjs';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, Inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { LayoutConfigService, SplashScreenService, TranslationService } from './core/_base/layout';
import { LayoutConfig } from './core/_config/layout.config';
// language list
import { locale as viLang } from './core/_config/i18n/vi';
import { Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { FormControlName } from '@angular/forms';

const originFormControlNameNgOnChanges = FormControlName.prototype.ngOnChanges;
FormControlName.prototype.ngOnChanges = function () {
  const result = originFormControlNameNgOnChanges.apply(this, arguments);
  this.control.nativeElement = this.valueAccessor._elementRef ? this.valueAccessor._elementRef.nativeElement : null;
  return result;
};

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'body[kt-root]',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit, OnDestroy {
	title: string = "";
	loader: boolean = false;
	unsubscribe: Subscription[] = [];

	constructor(private translationService: TranslationService,
		private router: Router,
		private layoutConfigService: LayoutConfigService,
		private splashScreenService: SplashScreenService,
		private titleService: Title,
		@Inject(DOCUMENT) private _document: HTMLDocument) {

		// register translations
		this.translationService.loadTranslations(viLang);
		// init layout config sớm để các route con (auth...) dùng được getConfig
		this.layoutConfigService.loadConfigs(new LayoutConfig().configs);
	}

	ngOnInit(): void {
		// enable/disable loader
		this.loader = this.layoutConfigService.getConfig('loader.enabled');
		const routerSubscription = this.router.events.subscribe(event => {
			if (event instanceof NavigationEnd) {
				// hide splash screen
				this.splashScreenService.hide();
				// scroll to top on every route change
				window.scrollTo(0, 0);
				// to display back the body content
				setTimeout(() => {
					document.body.classList.add('kt-page--loaded');
				}, 500);
			}
		});
		this.unsubscribe.push(routerSubscription);
		let constant = this.layoutConfigService.getConfig('constants');
		if (constant) 
			this.titleService.setTitle(constant.title);
		let appFavicon = this._document.getElementById('appFavicon');
		if (appFavicon && constant)
			appFavicon.setAttribute('href', constant.favicon);
	}

	ngOnDestroy() {
		this.unsubscribe.forEach(sb => sb.unsubscribe());
	}
}