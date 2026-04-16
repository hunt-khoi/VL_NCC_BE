import { DanhSachPhatComponent } from './danh-sach-phat/danh-sach-phat.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NhapBaoHiemListComponent } from './nhap-bao-hiem-list/nhap-bao-hiem-list.component';
import { NhapBaoHiemComponent } from './nhap-bao-hiem.component';
import { NhapBaoHiemService } from './Services/nhap-bao-hiem.service';
import { NhapBaoHiemRefModule } from './nhap-bao-hiem-ref.module';
import { DPSCommonModule } from '../../dps-common.module';
import { NhapBaoHiemDonViComponent } from './nhap-bao-hiem-don-vi/nhap-bao-hiem-don-vi.component';

const routes: Routes = [
	{
		path: '',
		component: NhapBaoHiemComponent,
		children: [
			{
				path: '',
				component: NhapBaoHiemDonViComponent,
			},
			{
				path: ':id',
				component: DanhSachPhatComponent,
			},
		]
	}
];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		DPSCommonModule,
		NhapBaoHiemRefModule,
	],
	providers: [
		NhapBaoHiemService,
	],
	entryComponents: [
		NhapBaoHiemListComponent
	],
	declarations: [
		NhapBaoHiemComponent,
		NhapBaoHiemDonViComponent,
		DanhSachPhatComponent,
		NhapBaoHiemListComponent
	]
})
export class NhapBaoHiemModule { }
