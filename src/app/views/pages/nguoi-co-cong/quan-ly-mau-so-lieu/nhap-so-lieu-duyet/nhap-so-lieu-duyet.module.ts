import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { NhapSoLieuDuyetComponent } from './nhap-so-lieu-duyet.component';
import { NhapSoLieuDuyetListComponent } from './nhap-so-lieu-duyet-list/nhap-so-lieu-duyet-list.component';
import { NhapSoLieuDuyetRefModule } from './nhap-so-lieu-duyet-ref.module';
import { NhapSoLieuDuyetService } from './services/nhap-so-lieu-duyet.service';
import { DuyetSoLieuPageComponent } from './duyet-so-lieu-page/duyet-so-lieu-page.component';
import { NhapSoLieuRefModule } from '../nhap-so-lieu/nhap-so-lieu-ref.module';

const routes: Routes = [
	{
		path: '',
		component: NhapSoLieuDuyetComponent,
		children: [
			{
				path: '',
				component: NhapSoLieuDuyetListComponent,
			},
			{
				path: 'so-lieu/:id',
				component: DuyetSoLieuPageComponent,
			},
		]
	}
];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		DPSCommonModule,
		NhapSoLieuDuyetRefModule,
		NhapSoLieuRefModule
	],
	providers: [
		NhapSoLieuDuyetService,
	],
	entryComponents: [
	],
	declarations: [
		DuyetSoLieuPageComponent
	],
})
export class NhapSoLieuDuyetModule { }
