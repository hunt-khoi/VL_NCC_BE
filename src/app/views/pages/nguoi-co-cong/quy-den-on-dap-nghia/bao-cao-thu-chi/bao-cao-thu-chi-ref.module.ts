import { NgModule } from '@angular/core';
import { DPSCommonModule } from '../../dps-common.module';
import { BaoCaoThuChiService } from './Services/bao-cao-thu-chi.service';
import { BaoCaoThuChiTabComponent } from './bao-cao-thu-chi-tab.component';
import { BaoCaoTheoNDChiComponent } from './bao-cao-theo-nd-chi/bao-cao-theo-nd-chi.component';
import { BaoCaoQuyThuChiComponent } from './bao-cao-quy-thu-chi/bao-cao-quy-thu-chi.component';
import { BaoCaoChiQuyComponent } from './bao-cao-chi-quy/bao-cao-chi-quy.component';
import { BaoCaoTheoKyComponent } from './bao-cao-theo-ky/bao-cao-theo-ky.component';
import { BaoCaoThuChiCTComponent } from './bao-cao-chi-tiet-thu-chi/bao-cao-chi-tiet-thu-chi.component';

@NgModule({
	imports: [
		DPSCommonModule
	],
	providers: [
		BaoCaoThuChiService
	],
	entryComponents: [
		BaoCaoThuChiTabComponent,
		BaoCaoTheoNDChiComponent,
		BaoCaoQuyThuChiComponent,
		BaoCaoChiQuyComponent,
		BaoCaoTheoKyComponent,
		BaoCaoThuChiCTComponent
	],
	declarations: [
		BaoCaoThuChiTabComponent,
		BaoCaoTheoNDChiComponent,
		BaoCaoQuyThuChiComponent,
		BaoCaoChiQuyComponent,
		BaoCaoTheoKyComponent,
		BaoCaoThuChiCTComponent
	],
	exports:[
		BaoCaoThuChiTabComponent,
		BaoCaoTheoNDChiComponent,
		BaoCaoQuyThuChiComponent,
		BaoCaoChiQuyComponent,
		BaoCaoTheoKyComponent,
		BaoCaoThuChiCTComponent
	]
})
export class BaoCaoThuChiRefModule { }
