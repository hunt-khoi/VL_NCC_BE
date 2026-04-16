import { NgModule } from '@angular/core';

import { DPSCommonModule } from '../../dps-common.module';
import { ThongKeHoTroService } from './Services/thong-ke-ho-tro.service';
import { ThongKeChiTietComponent } from './thong-ke-chi-tiet/thong-ke-chi-tiet.component';
import { ThongKeHoTroTabComponent } from './thong-ke-ho-tro-tab.component';
import { ThongKeTongHopDialogComponent } from './thong-ke-tong-hop-dialog/thong-ke-tong-hop-dialog.component';
import { ThongKeTongHopComponent } from './thong-ke-tong-hop/thong-ke-tong-hop.component';

@NgModule({
	imports: [
		DPSCommonModule
	],
	providers: [
		ThongKeHoTroService
	],
	entryComponents: [
		ThongKeHoTroTabComponent,
		ThongKeChiTietComponent,
		ThongKeTongHopComponent,
		ThongKeTongHopDialogComponent
	],
	declarations: [
		ThongKeHoTroTabComponent,
		ThongKeChiTietComponent,
		ThongKeTongHopComponent,
		ThongKeTongHopDialogComponent
	],
	exports:[
		ThongKeHoTroTabComponent,
		ThongKeChiTietComponent,
		ThongKeTongHopComponent,
		ThongKeTongHopDialogComponent
	]
})
export class ThongKeHoTroRefModule { }
