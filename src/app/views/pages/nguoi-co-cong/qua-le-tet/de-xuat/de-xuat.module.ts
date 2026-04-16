import { TangQuaDialogComponent } from './tang-qua-dialog/tang-qua-dialog.component';
import { PhatQuaService } from './Services/phat-qua.service';
import { DanhSachTangQuaComponent } from './danh-sach-tang-qua/danh-sach-tang-qua.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DeXuatListComponent } from './de-xuat-list/de-xuat-list.component';
import { DeXuatComponent } from './de-xuat.component';
import { DeXuatService } from './Services/de-xuat.service';
import { DeXuatRefModule } from './de-xuat-ref.module';
import { DPSCommonModule } from '../../dps-common.module';
import { DeXuatDonViComponent } from './de-xuat-don-vi/de-xuat-don-vi.component';
import { DeXuatImportDialogComponent } from './de-xuat-import/de-xuat-import.dialog.component';
import { dottangquaDuyetDialogComponent } from './dot-tang-qua-duyet/dot-tang-qua-duyet.dialog.component';
import { dottangquaImportDialogComponent } from './dot-tang-qua-import/dot-tang-qua-import.dialog.component';
import { DoiTuongNhanQuaRefModule } from '../doi-tuong-nhan-qua/doi-tuong-nhan-qua-ref.module';

const routes: Routes = [
	{
		path: '',
		component: DeXuatComponent,
		children: [
			{
				path: '',
				component: DeXuatDonViComponent,
			},
			{
				path: ':id',
				component: DanhSachTangQuaComponent,
			},
		]
	}
];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		DPSCommonModule,
		DeXuatRefModule,
		DoiTuongNhanQuaRefModule
	],
	providers: [
		DeXuatService,
		PhatQuaService
	],
	entryComponents: [
		DeXuatListComponent,
		DeXuatImportDialogComponent,
		dottangquaDuyetDialogComponent,
		dottangquaImportDialogComponent,
		TangQuaDialogComponent
	],
	declarations: [
		DeXuatComponent,
		DeXuatDonViComponent,
		DanhSachTangQuaComponent,
		DeXuatListComponent,
		DeXuatImportDialogComponent,
		dottangquaDuyetDialogComponent,
		dottangquaImportDialogComponent,
		TangQuaDialogComponent
	]
})
export class DeXuatModule { }
