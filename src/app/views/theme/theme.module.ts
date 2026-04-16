import { NgxPermissionsModule } from 'ngx-permissions';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule, MatProgressBarModule, MatTabsModule, MatTooltipModule, MatBadgeModule } from '@angular/material';
import { NgbProgressbarModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { LoadingBarModule } from '@ngx-loading-bar/core';
// Ngx DatePicker
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { InlineSVGModule } from 'ng-inline-svg';
// Core Module
import { CoreModule } from '../../core/core.module';
import { HeaderComponent } from './header/header.component';
import { AsideLeftComponent } from './aside/aside-left.component';
import { SubheaderComponent } from './subheader/subheader.component';
import { BrandComponent } from './brand/brand.component';
import { TopbarComponent } from './header/topbar/topbar.component';
import { MenuHorizontalComponent } from './header/menu-horizontal/menu-horizontal.component';
import { PartialsModule } from '../partials/partials.module';
import { BaseComponent } from './base/base.component';
import { PagesModule } from '../pages/pages.module';
import { HtmlClassService } from './html-class.service';
import { HeaderMobileComponent } from './header/header-mobile/header-mobile.component';
import { ErrorPageComponent } from './content/error-page/error-page.component';
import { PagesRoutingModule } from '../pages/pages-routing.module';
import { SubheaderTabComponent } from './header/subheader-tab/subheader-tab.component';
import { SignalRService } from '../pages/nguoi-co-cong/services/signalR.service';

@NgModule({
	declarations: [
		BaseComponent,
		// headers
		HeaderComponent,
		BrandComponent,
		HeaderMobileComponent,
		// subheader
		SubheaderComponent,
		// topbar components
		TopbarComponent,
		// aside left menu components
		AsideLeftComponent,
		// horizontal menu components
		MenuHorizontalComponent,

		ErrorPageComponent,
		SubheaderTabComponent
	],
	exports: [
		BaseComponent,

		// headers
		HeaderComponent,
		BrandComponent,
		HeaderMobileComponent,
		// subheader
		SubheaderComponent,
		// topbar components
		TopbarComponent,
		// aside left menu components
		AsideLeftComponent,
		// horizontal menu components
		MenuHorizontalComponent,

		ErrorPageComponent,
		SubheaderTabComponent
	],
	providers: [
		HtmlClassService,
		SignalRService
	],
	imports: [
		CommonModule,
		RouterModule,
		NgxPermissionsModule.forChild(),
		PagesModule,
		PartialsModule,
		CoreModule,
		PerfectScrollbarModule,
		FormsModule,
		MatProgressBarModule,
		MatTabsModule,
		MatButtonModule,
		MatTooltipModule,
		TranslateModule.forChild(),
		LoadingBarModule,
		NgxDaterangepickerMd,
		InlineSVGModule,

		// ng-bootstrap modules
		NgbProgressbarModule,
		NgbTooltipModule,
		PagesRoutingModule,
		MatTabsModule,
		MatBadgeModule
	]
})
export class ThemeModule { }