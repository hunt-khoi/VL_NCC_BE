import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { NhapSoLieuDuyetService } from './services/nhap-so-lieu-duyet.service';
import { NhapSoLieuDuyetComponent } from './nhap-so-lieu-duyet.component';
import { NhapSoLieuDuyetDialogComponent } from './nhap-so-lieu-duyet/nhap-so-lieu-duyet-dialog.component';
import { NhapSoLieuDuyetListComponent } from './nhap-so-lieu-duyet-list/nhap-so-lieu-duyet-list.component';

@NgModule({
	imports: [
		RouterModule,
		DPSCommonModule,
	],
	providers: [
		NhapSoLieuDuyetService,
	],
	entryComponents: [
		NhapSoLieuDuyetComponent,
		NhapSoLieuDuyetDialogComponent,
	],
	declarations: [
		NhapSoLieuDuyetComponent,
		NhapSoLieuDuyetListComponent,
		NhapSoLieuDuyetDialogComponent,
	],
	exports: [
		NhapSoLieuDuyetListComponent,
		NhapSoLieuDuyetComponent,
		NhapSoLieuDuyetDialogComponent,
	]
})

export class NhapSoLieuDuyetRefModule { }
