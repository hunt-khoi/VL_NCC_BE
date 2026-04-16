import { NgModule } from '@angular/core';
import { DeXuatService } from './Services/de-xuat.service';
import { DPSCommonModule } from '../../dps-common.module';
import { DeXuatEditDialogComponent } from './de-xuat-edit/de-xuat-edit.dialog.component';
import { SoQuyetDinhComponent } from './so-quyet-dinh/so-quyet-dinh.component';
import { DoiTuongNhanQuaRefModule } from '../doi-tuong-nhan-qua/doi-tuong-nhan-qua-ref.module';

@NgModule({
	imports: [
		DPSCommonModule,
		DoiTuongNhanQuaRefModule
	],
	providers: [
		DeXuatService
	],
	entryComponents: [
		DeXuatEditDialogComponent,
		SoQuyetDinhComponent
	],
	declarations: [
		DeXuatEditDialogComponent,
		SoQuyetDinhComponent
	],
	exports:[ 
	]
})

export class DeXuatRefModule { }
