import { NgModule } from '@angular/core';
import { DPSCommonModule } from '../../dps-common.module';

import { MauSoLieuService } from '../mau-so-lieu/Services/mau-so-lieu.service';
import { MauSoLieuEditDialogComponent } from './mau-so-lieu-edit/mau-so-lieu-edit-dialog.component';
import { MauSoLieuListComponent } from './mau-so-lieu-list/mau-so-lieu-list.component';
import { MauSoLieuComponent } from './mau-so-lieu.component';
import { MauSoLieuDetailEditDialogComponent } from './mau-so-lieu-detail-edit/mau-so-lieu-detail-edit-dialog.component';
import { PhiSoLieuEditDialogComponent } from './phi-so-lieu-edit/phi-so-lieu-edit-dialog.component';
import { SoLieuBoSungEditDialogComponent } from './so-lieu-bo-sung-edit/so-lieu-bo-sung-edit-dialog.component';
import { MauSoLieuDonViDialogComponent } from './mau-so-lieu-don-vi/mau-so-lieu-don-vi-dialog.component';
import { MauSoLieuGiaoDialogComponent } from './mau-so-lieu-giao/mau-so-lieu-giao-dialog.component';
import { ListPhienBanDialogComponent } from './list-phien-ban-dialog/list-phien-ban.dialog.component';
import { SoLuongGiaoDialogComponent } from './so-luong-giao/so-luong-giao-dialog.component';

@NgModule({
	imports: [
		DPSCommonModule,
	],
	providers: [
		MauSoLieuService,
	],
	entryComponents: [
		MauSoLieuComponent,
		MauSoLieuEditDialogComponent,
		MauSoLieuDetailEditDialogComponent,
		PhiSoLieuEditDialogComponent,
		SoLieuBoSungEditDialogComponent,
		MauSoLieuDonViDialogComponent,
		MauSoLieuGiaoDialogComponent,
		ListPhienBanDialogComponent,
		SoLuongGiaoDialogComponent
	],
	declarations: [
		MauSoLieuListComponent,
		MauSoLieuEditDialogComponent,
		MauSoLieuDetailEditDialogComponent,
		PhiSoLieuEditDialogComponent,
		SoLieuBoSungEditDialogComponent,
		MauSoLieuDonViDialogComponent,
		MauSoLieuGiaoDialogComponent,
		ListPhienBanDialogComponent,
		SoLuongGiaoDialogComponent
	],
	exports: [MauSoLieuListComponent]
})

export class MauSoLieuRefModule { }
