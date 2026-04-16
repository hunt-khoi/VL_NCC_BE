// Angular
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
	MatAutocompleteModule,
	MatButtonModule,
	MatCardModule,
	MatCheckboxModule,
	MatDatepickerModule,
	MatDialogModule,
	MatIconModule,
	MatInputModule,
	MatMenuModule,
	MatNativeDateModule,
	MatPaginatorModule,
	MatProgressBarModule,
	MatProgressSpinnerModule,
	MatRadioModule,
	MatSelectModule,
	MatSnackBarModule,
	MatSortModule,
	MatTableModule,
	MatTabsModule,
	MatTooltipModule,
	MAT_DIALOG_DEFAULT_OPTIONS,
    MatBadgeModule,
    MatChipsModule,
} from '@angular/material';
// NgBootstrap
import { NgbDropdownModule, NgbTabsetModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
// Perfect Scrollbar
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
// Core module
import { CoreModule } from '../../core/core.module';
// CRUD Partials
import {
	ActionNotificationComponent,
	AlertComponent,
	DeleteEntityDialogComponent,
	FetchEntityDialogComponent,
	UpdateStatusDialogComponent,
} from './content/crud';
// Layout partials
import {
	ContextMenu2Component,
	ContextMenuComponent,
	NotificationComponent,
	QuickActionComponent,
	QuickPanelComponent,
	ScrollTopComponent,
	SearchResultComponent,
	SplashScreenComponent,
	Subheader1Component,
	Subheader2Component,
	Subheader3Component,
	UserProfileComponent,
	VaiTroComponent
} from './layout';
// General
import { NoticeComponent } from './content/general/notice/notice.component';
import { PortletModule } from './content/general/portlet/portlet.module';
// Errpr
import { ErrorComponent } from './content/general/error/error.component';
// Extra module
//import { WidgetModule } from './content/widgets/widget.module';
// SVG inline
import { InlineSVGModule } from 'ng-inline-svg';
import { CommonService } from '../pages/nguoi-co-cong/services/common.service';
import { CKEditorModule } from 'ckeditor4-angular';
import { UploadFileComponent } from '../pages/nguoi-co-cong/components/upload-file/upload-file.component';
import { ImageControlModule } from 'dps-lib';
import { TranslateModule } from '@ngx-translate/core';
import { ChartsModule } from 'ng2-charts';
import {ScrollingModule} from '@angular/cdk/scrolling';
import { AvatarModule } from 'ngx-avatar';
@NgModule({
	declarations: [
		ScrollTopComponent,
		NoticeComponent,
		ActionNotificationComponent,
		DeleteEntityDialogComponent,
		FetchEntityDialogComponent,
		UpdateStatusDialogComponent,
		AlertComponent,

		// topbar components
		ContextMenu2Component,
		ContextMenuComponent,
		QuickPanelComponent,
		ScrollTopComponent,
		SearchResultComponent,
		SplashScreenComponent,
		Subheader1Component,
		Subheader2Component,
		Subheader3Component,
		NotificationComponent,
		QuickActionComponent,
		UserProfileComponent,
		ErrorComponent,
		UploadFileComponent,
		VaiTroComponent,
	],
	exports: [
		//WidgetModule,
		PortletModule,
		CKEditorModule,

		ScrollTopComponent,
		NoticeComponent,
		ActionNotificationComponent,
		DeleteEntityDialogComponent,
		FetchEntityDialogComponent,
		UpdateStatusDialogComponent,
		AlertComponent,

		// topbar components
		ContextMenu2Component,
		ContextMenuComponent,
		QuickPanelComponent,
		ScrollTopComponent,
		SearchResultComponent,
		SplashScreenComponent,
		Subheader1Component,
		Subheader2Component,
		Subheader3Component,
		NotificationComponent,
		QuickActionComponent,
		UserProfileComponent,
		ErrorComponent,
		UploadFileComponent,
		VaiTroComponent,
		ChartsModule
	],
	imports: [
		AvatarModule,
		CommonModule,
		RouterModule,
		FormsModule,
		ReactiveFormsModule,
		PerfectScrollbarModule,
		InlineSVGModule,
		CoreModule,
		PortletModule,
		//WidgetModule,

		// angular material modules
		MatButtonModule,
		MatMenuModule,
		MatSelectModule,
		MatInputModule,
		MatTableModule,
		MatAutocompleteModule,
		MatRadioModule,
		MatIconModule,
		MatNativeDateModule,
		MatProgressBarModule,
		MatDatepickerModule,
		MatCardModule,
		MatPaginatorModule,
		MatSortModule,
		MatCheckboxModule,
		MatProgressSpinnerModule,
		MatSnackBarModule,
		MatTabsModule,
		MatTooltipModule,
		MatDialogModule,
		MatBadgeModule,
		MatChipsModule,
		// ng-bootstrap modules
		NgbDropdownModule,
		NgbTabsetModule,
		NgbTooltipModule,
		TranslateModule,
		CKEditorModule,
		ImageControlModule,
		ChartsModule,
		ScrollingModule
	],
	entryComponents: [
		VaiTroComponent,
		UploadFileComponent,
		ActionNotificationComponent
	],
	providers: [
		CommonService,
		{
			provide: MAT_DIALOG_DEFAULT_OPTIONS,
			useValue: {
				hasBackdrop: true,
				panelClass: 'kt-mat-dialog-container__wrapper',
				height: 'auto',
				width: '900px'
			}
		}]
})
export class PartialsModule { }