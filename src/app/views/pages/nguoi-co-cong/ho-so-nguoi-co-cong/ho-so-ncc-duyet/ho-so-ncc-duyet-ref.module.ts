import { HoSoNCCDuyetDialogComponent } from './ho-so-ncc-duyet/ho-so-ncc-duyet-dialog.component';
import { HoSoNCCDuyetListComponent } from './ho-so-ncc-duyet-list/ho-so-ncc-duyet-list.component';
import { HoSoNCCDuyetComponent } from './ho-so-ncc-duyet.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { HoSoNCCDuyetService } from './Services/ho-so-ncc-duyet.service';
import { HuongDanHuongThienDialogComponent } from './huong-dan-hoan-thien/huong-dan-hoan-thien-dialog.component';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { HuongDanListComponent } from './huong-dan-list/huong-dan-list.component';

@NgModule({
	imports: [
		RouterModule,
		DPSCommonModule,
		AngularEditorModule
	],
	providers: [
		HoSoNCCDuyetService,
	],
	entryComponents: [
		HoSoNCCDuyetComponent,
		HoSoNCCDuyetDialogComponent,
		HuongDanHuongThienDialogComponent,
		HuongDanListComponent
	],
	declarations: [
		HoSoNCCDuyetListComponent,
		HoSoNCCDuyetDialogComponent,
		HuongDanHuongThienDialogComponent,
		HuongDanListComponent
	],
	exports: [HoSoNCCDuyetListComponent]
})


export class HoSoNCCDuyetRefModule { }
