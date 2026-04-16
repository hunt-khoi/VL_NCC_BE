import { NgModule } from '@angular/core';
import { DPSCommonModule } from '../../dps-common.module';
import { NhapSoLieuService } from '../nhap-so-lieu/Services/nhap-so-lieu.service';
import { MauSoLieuService } from '../mau-so-lieu/Services/mau-so-lieu.service';
import { NhapSoLieuRefModule } from '../nhap-so-lieu/nhap-so-lieu-ref.module';

@NgModule({
	imports: [
		DPSCommonModule,
		NhapSoLieuRefModule
	],
	providers: [
		NhapSoLieuService,
		MauSoLieuService
	],
})

export class NhapSoLieuRefModule2 { }
