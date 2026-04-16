import { NgModule } from '@angular/core';
import { NhapBaoHiemDuyetListComponent } from './nhap-bao-hiem-duyet-list/nhap-bao-hiem-duyet-list.component';
import { NhapBaoHiemDuyetService } from './Services/nhap-bao-hiem-duyet.service';
import { DPSCommonModule } from '../../dps-common.module';
import { NhapBaoHiemDuyetDialogComponent } from './nhap-bao-hiem-duyet/nhap-bao-hiem-duyet.dialog.component';
import { NhapBaoHiemRefModule } from '../nhap-bao-hiem/nhap-bao-hiem-ref.module';

@NgModule({
	imports: [
		DPSCommonModule,
		NhapBaoHiemRefModule
	],
	providers: [
		NhapBaoHiemDuyetService
	],
	entryComponents: [
		NhapBaoHiemDuyetListComponent,
		NhapBaoHiemDuyetDialogComponent,
	],
	declarations: [
		NhapBaoHiemDuyetListComponent,
		NhapBaoHiemDuyetDialogComponent,
	],
	exports: [
		NhapBaoHiemDuyetListComponent,
	]
})
export class NhapBaoHiemDuyetRefModule { }
