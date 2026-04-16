import { NgModule } from '@angular/core';
import { DPSCommonModule } from '../../dps-common.module';
import { tracuuHoSoService } from './Services/tra-cuu-ho-so.service';
import { TKPhanBoComponent } from './tk-phan-bo/tk-phan-bo.component';
import { thongKeTheoDoiTuongNewComponent } from './tk-theo-doi-tuong-new/tk-theo-doi-tuong-new.component';
import { thongKeTheoDoiTuongComponent } from './tk-theo-doi-tuong/tk-theo-doi-tuong.component';
import { thongKeTheoMucQuaComponent } from './tk-theo-muc-qua/tk-theo-muc-qua.component';
import { thongKeTongHopComponent } from './tk-tong-hop/tk-tong-hop.component';

@NgModule({
	imports: [
		DPSCommonModule
	],
	providers: [
		tracuuHoSoService
	],
	entryComponents: [
		thongKeTheoDoiTuongComponent,
		thongKeTheoMucQuaComponent,
		thongKeTongHopComponent,
	],
	declarations: [
		thongKeTheoDoiTuongComponent,
		thongKeTheoMucQuaComponent,
		thongKeTongHopComponent,
		thongKeTheoDoiTuongNewComponent,
		TKPhanBoComponent,
	],
	exports:[
		thongKeTheoDoiTuongComponent,
		thongKeTheoMucQuaComponent,
		thongKeTongHopComponent,
		thongKeTheoDoiTuongNewComponent,
		TKPhanBoComponent
	]
})
export class tracuuHoSoRefModule { }
