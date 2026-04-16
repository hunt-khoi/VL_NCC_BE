// Angular
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
//Component
import { QuaTrinhKhongCoNguoiDuyetComponent } from './qua-trinh-khong-co-nguoi-duyet.component';
import { QuaTrinhKhongCoNguoiDuyetListComponent } from './qua-trinh-khong-co-nguoi-duyet-list/qua-trinh-khong-co-nguoi-duyet-list.component';
import { QuaTrinhKhongCoNguoiDuyetEditComponent } from './qua-trinh-khong-co-nguoi-duyet-edit/qua-trinh-khong-co-nguoi-duyet-edit.component';
//Service
import { QuaTrinhKhongCoNguoiDuyetService } from './Services/qua-trinh-khong-co-nguoi-duyet.service';
import { NhapSoLieuDuyetService } from './../../quan-ly-mau-so-lieu/nhap-so-lieu-duyet/services/nhap-so-lieu-duyet.service';
import { DeXuatService } from './../../qua-le-tet/de-xuat/Services/de-xuat.service';
import { HoSoNCCDuyetService } from './../../ho-so-nguoi-co-cong/ho-so-ncc-duyet/Services/ho-so-ncc-duyet.service';
import { NhapBaoHiemDuyetService } from '../../bao-hiem-y-te/nhap-bao-hiem-duyet/Services/nhap-bao-hiem-duyet.service';
import { HoSoNhaOService } from '../../ho-tro-nha-o/ho-so-nha-o/Services/ho-so-nha-o.service';
import { NienHanService } from '../../nien-han-dung-cu/nien-han/Services/nien-han.service';
import { HoTroService } from '../../quy-den-on-dap-nghia/ho-tro/Services/ho-tro.service';

const routes: Routes = [
	{
		path: '',
		component: QuaTrinhKhongCoNguoiDuyetComponent,
		children: [
			{
				path: '',
				component: QuaTrinhKhongCoNguoiDuyetListComponent,
			}
		]
	}
];
@NgModule({
	imports: [
		RouterModule.forChild(routes),
		DPSCommonModule
	],
	providers: [
		QuaTrinhKhongCoNguoiDuyetService,
		HoSoNCCDuyetService,
		DeXuatService,
		NhapSoLieuDuyetService,
		NhapBaoHiemDuyetService,
		HoSoNhaOService,
		NienHanService,
		HoTroService,
	],
	entryComponents: [
		QuaTrinhKhongCoNguoiDuyetEditComponent
	],
	declarations: [
		QuaTrinhKhongCoNguoiDuyetComponent,
		QuaTrinhKhongCoNguoiDuyetListComponent,
		QuaTrinhKhongCoNguoiDuyetEditComponent
	]
})
export class QuaTrinhKhongCoNguoiDuyetModule {}
