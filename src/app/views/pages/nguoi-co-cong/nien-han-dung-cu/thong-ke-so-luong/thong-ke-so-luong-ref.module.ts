import { NgModule } from '@angular/core';
import { DPSCommonModule } from '../../dps-common.module';
import { BaoCaoTongHopComponent } from './bao-cao-tong-hop/bao-cao-tong-hop.component';
import { ThongKeSoLuongService } from './Services/thong-ke-so-luong.service';
import { ThongKeTabComponent } from './thong-ke-tab.component';
import { ThongKeTheoDoiTuongComponent } from './thong-ke-theo-doi-tuong/thong-ke-theo-doi-tuong.component';
import { ThongKeTheoDungCuComponent } from './thong-ke-theo-dung-cu/thong-ke-theo-dung-cu.component';
import { ThongKeTheoNienHanComponent } from './thong-ke-theo-nien-han/thong-ke-theo-nien-han.component';

@NgModule({
	imports: [
		DPSCommonModule
	],
	providers: [
		ThongKeSoLuongService
	],
	entryComponents: [
		ThongKeTabComponent,
		ThongKeTheoDoiTuongComponent,
		ThongKeTheoNienHanComponent,
		ThongKeTheoDungCuComponent,
		BaoCaoTongHopComponent

	],
	declarations: [
		ThongKeTabComponent,
		ThongKeTheoDoiTuongComponent,
		ThongKeTheoNienHanComponent,
		ThongKeTheoDungCuComponent,
		BaoCaoTongHopComponent

	],
	exports:[
		ThongKeTabComponent,
		ThongKeTheoDoiTuongComponent,
		BaoCaoTongHopComponent,
		ThongKeTheoNienHanComponent,
		ThongKeTheoDungCuComponent
	]
})
export class ThongKeSoLuongRefModule { }
