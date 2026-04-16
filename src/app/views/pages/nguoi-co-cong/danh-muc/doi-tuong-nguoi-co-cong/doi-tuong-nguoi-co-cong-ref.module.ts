import { DoiTuongNguoiCoCongEditDialogComponent } from './doi-tuong-nguoi-co-cong-edit/doi-tuong-nguoi-co-cong-edit-dialog.component';
import { DoiTuongNguoiCoCongListComponent } from './doi-tuong-nguoi-co-cong-list/doi-tuong-nguoi-co-cong-list.component';
import { DoiTuongNguoiCoCongComponent } from './doi-tuong-nguoi-co-cong.component';
import { NgModule } from '@angular/core';
import { DPSCommonModule } from '../../dps-common.module';
import { DoiTuongNguoiCoCongService } from '../doi-tuong-nguoi-co-cong/Services/doi-tuong-nguoi-co-cong.service';
import { DoiTuongNhanQuaListComponent } from './doi-tuong-nhan-qua-list/doi-tuong-nhan-qua-list.component';
import { DoiTuongNhanQuaEditComponent } from './doi-tuong-nhan-qua-edit/doi-tuong-nhan-qua-edit.component';
import { DoiTuongNhanQuaMucQuaComponent } from './doi-tuong-nhan-qua-muc-qua/doi-tuong-nhan-qua-muc-qua.component';
import { UpdateMucQuaDialogComponent } from './update-muc-qua/update-muc-qua.dialog.component';
import { DoiTuongNhanQuaMucQuaListComponent } from './doi-tuong-nhan-qua-muc-qua-list/doi-tuong-nhan-qua-muc-qua-list.component';
import { UpdateBieuMauDialogComponent } from './update-bieu-mau-dialog/update-bieu-mau-dialog.component';
import { DoiTuongBaoHiemEditComponent } from './doi-tuong-bao-hiem-edit/doi-tuong-bao-hiem-edit.component';
import { DoiTuongBaoHiemListComponent } from './doi-tuong-bao-hiem-list/doi-tuong-bao-hiem-list.component';
import { DoiTuongDungCuEditComponent } from './doi-tuong-dung-cu-edit/doi-tuong-dung-cu-edit.component';
import { DoiTuongDungCuListComponent } from './doi-tuong-dung-cu-list/doi-tuong-dung-cu-list.component';
import { ChonNhieuDungCuListComponent } from '../../components';

@NgModule({
	imports: [
		DPSCommonModule,
	],
	providers: [
		DoiTuongNguoiCoCongService,
	],
	entryComponents: [
		DoiTuongNguoiCoCongComponent,
		DoiTuongNhanQuaEditComponent,
		DoiTuongNhanQuaMucQuaComponent,
		UpdateMucQuaDialogComponent,
		UpdateBieuMauDialogComponent,
		DoiTuongDungCuEditComponent,
		ChonNhieuDungCuListComponent,
		DoiTuongBaoHiemEditComponent
	],
	declarations: [
		DoiTuongNguoiCoCongListComponent,
		DoiTuongNguoiCoCongEditDialogComponent,
		DoiTuongNhanQuaListComponent,
		DoiTuongNhanQuaEditComponent,
		DoiTuongNhanQuaMucQuaComponent,
		DoiTuongNhanQuaMucQuaListComponent,
		UpdateMucQuaDialogComponent,
		UpdateBieuMauDialogComponent,
		DoiTuongDungCuListComponent,
		DoiTuongDungCuEditComponent,
		ChonNhieuDungCuListComponent,
		DoiTuongBaoHiemListComponent,
		DoiTuongBaoHiemEditComponent
	],
	exports: [
		DoiTuongNguoiCoCongListComponent,
		DoiTuongNhanQuaListComponent,
		DoiTuongNhanQuaMucQuaListComponent,
		UpdateBieuMauDialogComponent,
		DoiTuongDungCuListComponent,
		DoiTuongBaoHiemListComponent,
	]
})

export class DoiTuongNguoiCoCongRefModule { }