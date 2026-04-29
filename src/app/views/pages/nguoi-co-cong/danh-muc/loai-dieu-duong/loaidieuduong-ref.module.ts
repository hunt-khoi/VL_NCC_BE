import { NgModule } from '@angular/core';
import { DPSCommonModule } from '../../dps-common.module';
import { loaiDieuDuongServices } from './Services/loaidieuduong.service';
import { LoaiDieuDuongListComponent } from './loai-dieu-duong-list/loaidieuduong-list.component';
import { LoaiDieuDuongEditDialogComponent } from './loai-dieu-duong-edit/loaidieuduong-edit.dialog.component';

@NgModule({
	imports: [
		DPSCommonModule,
	],
	providers: [
		loaiDieuDuongServices
	],
	entryComponents: [
		LoaiDieuDuongListComponent
	],
	declarations: [
		LoaiDieuDuongListComponent,
		LoaiDieuDuongEditDialogComponent 
	],
	exports:[
		LoaiDieuDuongListComponent
	]
})

export class loaiDieuDuongRefModule { }