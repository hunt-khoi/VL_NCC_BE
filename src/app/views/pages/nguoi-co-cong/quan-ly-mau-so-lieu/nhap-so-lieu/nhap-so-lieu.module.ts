import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { NhapSoLieuService } from './Services/nhap-so-lieu.service';
import { NhapSoLieuRefModule } from './nhap-so-lieu-ref.module';
import { MauSoLieuService } from '../mau-so-lieu/Services/mau-so-lieu.service';
import { NhapSoLieuDuyetRefModule } from '../nhap-so-lieu-duyet/nhap-so-lieu-duyet-ref.module';
import { NhapSoLieuComponent } from './nhap-so-lieu.component';
import { NhapSoLieuListComponent } from './nhap-so-lieu-list/nhap-so-lieu-list.component';

const routes: Routes = [
	{
		path: '',
		component: NhapSoLieuComponent,
		children: [
			{
				path: '',
				component: NhapSoLieuListComponent,
			},
		]
	}
];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		DPSCommonModule,
		NhapSoLieuRefModule,
		NhapSoLieuDuyetRefModule
	],
	providers: [
		NhapSoLieuService,
		MauSoLieuService
	],
	entryComponents: [
		NhapSoLieuListComponent,
	],
	declarations: [
		NhapSoLieuListComponent,
		NhapSoLieuComponent
	]
})
export class NhapSoLieuModule { }
