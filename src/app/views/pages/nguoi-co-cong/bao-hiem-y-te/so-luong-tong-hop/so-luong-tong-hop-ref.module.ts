import { NgModule } from '@angular/core';
import { DPSCommonModule } from '../../dps-common.module';
import { SoLuongTongHopService } from './Services/so-luong-tong-hop.service';
import { SoLuongTongHopTabComponent } from './so-luong-tong-hop-tab.component';
import { TKTheoDoiTuongComponent } from './thong-ke-theo-doi-tuong/thong-ke-theo-doi-tuong.component';

@NgModule({
	imports: [
		DPSCommonModule
	],
	providers: [
		SoLuongTongHopService
	],
	entryComponents: [
		SoLuongTongHopTabComponent,
		TKTheoDoiTuongComponent

	],
	declarations: [
		SoLuongTongHopTabComponent,
		TKTheoDoiTuongComponent

	],
	exports:[
		SoLuongTongHopTabComponent,
		TKTheoDoiTuongComponent,
	]
})
export class SoLuongTongHopRefModule { }
