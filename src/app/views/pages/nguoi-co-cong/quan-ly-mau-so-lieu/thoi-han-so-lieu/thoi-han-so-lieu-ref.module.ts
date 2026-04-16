import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { ThoiHanSoLieuService } from './Services/thoi-han-so-lieu.service';
import { ThoiHanSoLieuComponent } from './thoi-han-so-lieu.component';
import { ThoiHanSoLieuListComponent } from './thoi-han-so-lieu-list/thoi-han-so-lieu-list.component';
import { NhapSoLieuRefModule } from '../nhap-so-lieu/nhap-so-lieu-ref.module';

@NgModule({
	imports: [
		RouterModule,
		DPSCommonModule,
		NhapSoLieuRefModule
	],
	providers: [
		ThoiHanSoLieuService
	],
	entryComponents: [
		ThoiHanSoLieuComponent,
	],
	declarations: [
		ThoiHanSoLieuListComponent,
	],
	exports: [ThoiHanSoLieuListComponent]
})


export class ThoiHanSoLieuRefModule { }
