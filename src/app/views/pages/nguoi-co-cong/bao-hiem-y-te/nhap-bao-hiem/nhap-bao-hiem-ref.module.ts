import { NgModule } from '@angular/core';
import { NhapBaoHiemService } from './Services/nhap-bao-hiem.service';
import { DPSCommonModule } from '../../dps-common.module';
import { NhapBaoHiemEditDialogComponent } from './nhap-bao-hiem-edit/nhap-bao-hiem-edit.dialog.component';
import { DoiTuongBaoHiemRefModule } from '../doi-tuong-bao-hiem/doi-tuong-bao-hiem-ref.module';

@NgModule({
	imports: [
		DPSCommonModule,
		DoiTuongBaoHiemRefModule
	],
	providers: [
		NhapBaoHiemService
	],
	entryComponents: [
		NhapBaoHiemEditDialogComponent,
	],
	declarations: [
		NhapBaoHiemEditDialogComponent,
	],
	exports:[ 
	]
})
export class NhapBaoHiemRefModule { }
