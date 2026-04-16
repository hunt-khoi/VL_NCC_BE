import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { DoiTuongNhanQuaEditDialogComponent } from './doi-tuong-nhan-qua-edit/doi-tuong-nhan-qua-edit-dialog.component';
import { DoiTuongNhanQuaImportComponent } from './doi-tuong-nhan-qua-import/doi-tuong-nhan-qua-import.component';
import { DoiTuongNhanQuaListComponent } from './doi-tuong-nhan-qua-list/doi-tuong-nhan-qua-list.component';
import { DoiTuongNhanQuaService } from './Services/doi-tuong-nhan-qua.service';

@NgModule({
	imports: [
		RouterModule,
		DPSCommonModule,
	],
	providers: [
		DoiTuongNhanQuaService,
	],
	entryComponents: [
		DoiTuongNhanQuaImportComponent,
		DoiTuongNhanQuaEditDialogComponent
	],
	declarations: [
		DoiTuongNhanQuaListComponent,
		DoiTuongNhanQuaEditDialogComponent,
		DoiTuongNhanQuaImportComponent
	],
	exports: [DoiTuongNhanQuaListComponent, DoiTuongNhanQuaEditDialogComponent]
})


export class DoiTuongNhanQuaRefModule { }
