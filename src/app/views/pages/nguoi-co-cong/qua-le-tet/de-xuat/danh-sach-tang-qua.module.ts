import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { DeXuatRefModule } from './de-xuat-ref.module';
import { DoiTuongNhanQuaRefModule } from '../doi-tuong-nhan-qua/doi-tuong-nhan-qua-ref.module';
import { PhatQuaService } from './Services/phat-qua.service';
import { DanhSachTangQuaComponent } from './danh-sach-tang-qua/danh-sach-tang-qua.component';
import { DeXuatListComponent } from './de-xuat-list/de-xuat-list.component';
import { DeXuatImportDialogComponent } from './de-xuat-import/de-xuat-import.dialog.component';
import { dottangquaDuyetDialogComponent } from './dot-tang-qua-duyet/dot-tang-qua-duyet.dialog.component';
import { dottangquaImportDialogComponent } from './dot-tang-qua-import/dot-tang-qua-import.dialog.component';
import { TangQuaDialogComponent } from './tang-qua-dialog/tang-qua-dialog.component';

const routes: Routes = [
	{ path: '', component: DanhSachTangQuaComponent }
];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		DPSCommonModule,
		DeXuatRefModule,
		DoiTuongNhanQuaRefModule,
	],
	providers: [
		PhatQuaService,
	],
	entryComponents: [
		DeXuatListComponent,
		DeXuatImportDialogComponent,
		dottangquaDuyetDialogComponent,
		dottangquaImportDialogComponent,
		TangQuaDialogComponent,
	],
	declarations: [
		DanhSachTangQuaComponent,
		DeXuatListComponent,
		DeXuatImportDialogComponent,
		dottangquaDuyetDialogComponent,
		dottangquaImportDialogComponent,
		TangQuaDialogComponent,
	],
})
export class DanhSachTangQuaModule { }
