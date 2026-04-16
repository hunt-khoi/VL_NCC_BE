import { NgModule } from '@angular/core';
import { DPSCommonModule } from '../../dps-common.module';
import { NhapSoLieuService } from '../nhap-so-lieu/Services/nhap-so-lieu.service';
import { MauSoLieuService } from '../mau-so-lieu/Services/mau-so-lieu.service';
import { NhapSoLieuEditDialogComponent } from './nhap-so-lieu-edit/nhap-so-lieu-edit-dialog.component';

@NgModule({
	imports: [
		DPSCommonModule,
	],
	providers: [
		NhapSoLieuService,
		MauSoLieuService
	],
	entryComponents: [
		NhapSoLieuEditDialogComponent,
	],
	declarations: [
		NhapSoLieuEditDialogComponent,
	],
	exports: [NhapSoLieuEditDialogComponent]
})


export class NhapSoLieuRefModule { }
