import { NgModule } from '@angular/core';

import { DPSCommonModule } from '../../dps-common.module';
import { dottangquaService } from '../dot-tang-qua/Services/dot-tang-qua.service';
import { thongkeQuaCacNamComponent } from './tk-qua-cac-nam/tk-qua-cac-nam.component';
import { thongkeQuaCacNamTheoNhomComponent } from './tk-qua-cac-nam-theo-nhom/tk-qua-cac-nam-theo-nhom.component';
import { thongkeSLNhanQuaNamComponent } from './tk-slnhan-qua-cac-nam/tk-slnhan-qua-cac-nam.component';
import { thongkeSLNhanQuaNamTheoNhomComponent } from './tk-slnhan-qua-cac-nam-theo-nhom/tk-slnhan-qua-cac-nam-theo-nhom.component';
import { thongkeGiamQuaNamComponent } from './tk-giam-qua-cac-nam/tk-giam-qua-cac-nam.component';
import { thongkeGiamQuaNamTheoNhomComponent } from './tk-giam-qua-cac-nam-theo-nhom/tk-giam-qua-cac-nam-theo-nhom.component';

@NgModule({
	imports: [
		DPSCommonModule
	],
	providers: [
		dottangquaService
	],
	entryComponents: [
		thongkeQuaCacNamComponent,
		thongkeQuaCacNamTheoNhomComponent,
		thongkeSLNhanQuaNamComponent,
		thongkeSLNhanQuaNamTheoNhomComponent
	],
	declarations: [
		thongkeQuaCacNamComponent,
		thongkeQuaCacNamTheoNhomComponent,
		thongkeSLNhanQuaNamComponent,
		thongkeSLNhanQuaNamTheoNhomComponent,
		thongkeGiamQuaNamComponent,
		thongkeGiamQuaNamTheoNhomComponent
	],
	exports:[
		thongkeQuaCacNamComponent,
		thongkeQuaCacNamTheoNhomComponent,
		thongkeSLNhanQuaNamComponent,
		thongkeSLNhanQuaNamTheoNhomComponent,
		thongkeGiamQuaNamComponent,
		thongkeGiamQuaNamTheoNhomComponent
	]
})
export class thongkeTangGiamRefModule { }
