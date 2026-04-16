import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { NhapSoLieuRefModule2 } from './new-nhap-so-lieu-ref.module';
import { NhapSoLieuService } from '../nhap-so-lieu/Services/nhap-so-lieu.service';
import { MauSoLieuService } from '../mau-so-lieu/Services/mau-so-lieu.service';
import { NhapSoLieuComponent } from './new-nhap-so-lieu.component';
import { NhapSoLieuListComponent } from './new-nhap-so-lieu-list/new-nhap-so-lieu-list.component';

const routes: Routes = [
	{
		path: '',
		component: NhapSoLieuComponent,
		children: [
			{
				path: '',
				component: NhapSoLieuListComponent,
			},
			{
				path: ':id',
				component: NhapSoLieuListComponent,
			},
		]
	}
];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		DPSCommonModule,
		NhapSoLieuRefModule2,
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
