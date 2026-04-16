import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { PermissionViewHS } from './Services/permission-hs';
import { HoSoNCCService } from '../ho-so-ncc/Services/ho-so-ncc.service';
import { HoSoNCCRefModule } from '../ho-so-ncc/ho-so-ncc-ref.module';
import { InfoComponent } from './info/info.component';
import { HoSoNccViewDetailComponent } from './ho-so-ncc-view-detail.component';
import { DinhchinhthongtinDialogComponent } from './../dinh-chinh-thong-tin/dinhchinhthongtin-dialog/dinhchinhthongtin-dialog.component';
import { DinhChinhThongTinService } from './../dinh-chinh-thong-tin/Services/dinh-chinh-thong-tin.service';
import { DinhChinhThongTinComponent } from './../dinh-chinh-thong-tin/dinh-chinh-thong-tin.component';
import { GiayToService } from './../giay-to/Services/giay-to.service';
import { GiayToEditDialogComponent } from './../giay-to/giay-to-edit/giay-to-edit-dialog.component';
import { GiayToListComponent } from './../giay-to/giay-to-list/giay-to-list.component';
import { ThanNhanEditDialogComponent } from './../than-nhan/than-nhan-edit/than-nhan-edit-dialog.component';
import { ThanNhanListComponent } from '../than-nhan/than-nhan-list/than-nhan-list.component';
import { ThanNhanService } from '../than-nhan/Services/than-nhan.service';
import { TroCapListComponent } from '../tro-cap/tro-cap-list/tro-cap-list.component';
import { TroCapEditDialogComponent } from '../tro-cap/tro-cap-edit-dialog/tro-cap-edit-dialog.component';
import { TroCapService } from '../tro-cap/Services/tro-cap.service';
import { QuyetDinhRefModule } from '../quyet-dinh/quyet-dinh-ref.module';
import { QuaTrinhHoatDongListComponent } from '../qua-trinh-hoat-dong/qua-trinh-hoat-dong-list/qua-trinh-hoat-dong-list.component';
import { QuaTrinhHoatDongService } from '../qua-trinh-hoat-dong/Services/qua-trinh-hoat-dong.service';
import { QuaTrinhHoatDongEditDialogComponent } from '../qua-trinh-hoat-dong/qua-trinh-hoat-dong-edit/qua-trinh-hoat-dong-edit-dialog.component';
import { DiChuyenService } from '../di-chuyen/Services/di-chuyen.service';
import { DiChuyenEditDialogComponent } from '../di-chuyen/di-chuyen-edit/di-chuyen-edit-dialog.component';
import { DiChuyenListComponent } from '../di-chuyen/di-chuyen-list/di-chuyen-list.component';

const routes: Routes = [
	{
		path: '',
		component: HoSoNccViewDetailComponent,
		children: [
			{
				path: '',
				canActivate: [PermissionViewHS],
				component: InfoComponent,
			},
			{
				path: 'than-nhan',
				canActivate: [PermissionViewHS],
				component: ThanNhanListComponent,
			},
			{
				path: 'giay-to',
				canActivate: [PermissionViewHS],
				component: GiayToListComponent,
			},
			{
				path: 'tro-cap',
				canActivate: [PermissionViewHS],
				component: TroCapListComponent,
			},
			{
				path: 'qua-trinh-hoat-dong',
				canActivate: [PermissionViewHS],
				component: QuaTrinhHoatDongListComponent,
			},
			{
				path: 'di-chuyen',
				canActivate: [PermissionViewHS],
				component: DiChuyenListComponent,
			},
			{
				path: 'dinh-chinh-thong-tin',
				canActivate: [PermissionViewHS],
				component: DinhChinhThongTinComponent,
			},
		]
	}
];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		DPSCommonModule,
		HoSoNCCRefModule,
		QuyetDinhRefModule,
	],
	providers: [
		HoSoNCCService,
		ThanNhanService,
		GiayToService,
		TroCapService, 
		QuaTrinhHoatDongService,
		DiChuyenService,
		DinhChinhThongTinService,
		PermissionViewHS
	],
	entryComponents: [
		ThanNhanEditDialogComponent,
		GiayToEditDialogComponent,
		TroCapEditDialogComponent,
		QuaTrinhHoatDongEditDialogComponent,
		DiChuyenEditDialogComponent,
		DinhchinhthongtinDialogComponent
	],
	declarations: [
		HoSoNccViewDetailComponent,
		ThanNhanListComponent,
		ThanNhanEditDialogComponent,
		GiayToListComponent,
		GiayToEditDialogComponent,
		TroCapListComponent,
		TroCapEditDialogComponent,
		QuaTrinhHoatDongListComponent,
		QuaTrinhHoatDongEditDialogComponent,
		InfoComponent,
		DiChuyenEditDialogComponent,
		DinhchinhthongtinDialogComponent,
		DiChuyenListComponent,
		DinhChinhThongTinComponent
	],
})
export class HoSoNCCViewDetailModule { }
