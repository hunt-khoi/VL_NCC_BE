import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NhapBaoHiemDuyetListComponent } from './nhap-bao-hiem-duyet-list/nhap-bao-hiem-duyet-list.component';
import { NhapBaoHiemDuyetComponent } from './nhap-bao-hiem-duyet.component';
import { NhapBaoHiemDuyetService } from './Services/nhap-bao-hiem-duyet.service';
import { NhapBaoHiemDuyetRefModule } from './nhap-bao-hiem-duyet-ref.module';
import { DPSCommonModule } from '../../dps-common.module';
import { DuyetNhapBHPageComponent } from './duyet-nhap-bh-page/duyet-nhap-bh-page.component';

const routes: Routes = [
	{
		path: '',
		component: NhapBaoHiemDuyetComponent,
		children: [
			{
				path: '',
				component: NhapBaoHiemDuyetListComponent,
			},
			{
				path: 'danh-sach/:id',
				component: DuyetNhapBHPageComponent,
			},
		]
	}
];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		DPSCommonModule,
		NhapBaoHiemDuyetRefModule,
	],
	providers: [
		NhapBaoHiemDuyetService
	],
	entryComponents: [],
	declarations: [
		NhapBaoHiemDuyetComponent,
		DuyetNhapBHPageComponent,
	]
})
export class NhapBaoHiemDuyetModule { }
