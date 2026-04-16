import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { DoiTuongBaoHiemEditDialogComponent } from './doi-tuong-bao-hiem-edit/doi-tuong-bao-hiem-edit-dialog.component';
import { DoiTuongBaoHiemImportComponent } from './doi-tuong-bao-hiem-import/doi-tuong-bao-hiem-import.component';
import { DoiTuongBaoHiemListComponent } from './doi-tuong-bao-hiem-list/doi-tuong-bao-hiem-list.component';
import { DoiTuongBaoHiemService } from './Services/doi-tuong-bao-hiem.service';

@NgModule({
	imports: [
		RouterModule,
		DPSCommonModule,
	],
	providers: [
		DoiTuongBaoHiemService,
	],
	entryComponents: [
		DoiTuongBaoHiemImportComponent,
		DoiTuongBaoHiemEditDialogComponent
	],
	declarations: [
		DoiTuongBaoHiemListComponent,
		DoiTuongBaoHiemEditDialogComponent,
		DoiTuongBaoHiemImportComponent
	],
	exports: [DoiTuongBaoHiemListComponent, DoiTuongBaoHiemEditDialogComponent]
})


export class DoiTuongBaoHiemRefModule { }
