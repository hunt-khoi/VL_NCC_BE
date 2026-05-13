import { NgModule } from '@angular/core';
import { DPSCommonModule } from '../../dps-common.module';
import { DeXuatService } from './Services/de-xuat.service';
import { SoQuyetDinhComponent } from './so-quyet-dinh/so-quyet-dinh.component';
import { DoiTuongNhanQuaRefModule } from '../doi-tuong-nhan-qua/doi-tuong-nhan-qua-ref.module';
import { DeXuatListComponent } from './de-xuat-list/de-xuat-list.component';
import { DeXuatEditDialogComponent } from './de-xuat-edit/de-xuat-edit.dialog.component';

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
		DeXuatListComponent,
		DeXuatEditDialogComponent,
		SoQuyetDinhComponent
	],
	exports: [
		DeXuatListComponent,
	],
})

export class DeXuatRefModule { }