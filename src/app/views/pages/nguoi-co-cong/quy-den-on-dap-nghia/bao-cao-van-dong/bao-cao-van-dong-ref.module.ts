import { NgModule } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { DPSCommonModule } from '../../dps-common.module';
import { BaoCaoVanDongService } from './Services/bao-cao-thang.service';
import { BaoCaoThangComponent } from './bao-cao-thang/bao-cao-thang.component';
import { BaoCaoVanDongTabComponent } from './bao-cao-van-dong-tab.component';
import { BaoCaoThoiDiemComponent } from './bao-cao-thoi-diem/bao-cao-thoi-diem.component';

@NgModule({
	imports: [
		DPSCommonModule,
		MatRippleModule
	],
	providers: [
		BaoCaoVanDongService
	],
	entryComponents: [
		BaoCaoVanDongTabComponent,
		BaoCaoThangComponent,
		BaoCaoThoiDiemComponent
	],
	declarations: [
		BaoCaoVanDongTabComponent,
		BaoCaoThangComponent,
		BaoCaoThoiDiemComponent
	],
	exports:[
		BaoCaoVanDongTabComponent,
		BaoCaoThangComponent,
		BaoCaoThoiDiemComponent
	]
})
export class BaoCaoVanDongRefModule { }
