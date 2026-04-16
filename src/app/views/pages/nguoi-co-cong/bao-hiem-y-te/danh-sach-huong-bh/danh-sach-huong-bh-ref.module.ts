import { NgModule } from '@angular/core';
import { DPSCommonModule } from '../../dps-common.module';
import { DSHuongBaoHiemListComponent } from './danh-sach-huong-bh-list/danh-sach-huong-bh-list.component';
import { DSHuongBaoHiemService } from './Services/danh-sach-huong-bh.service';

@NgModule({
	imports: [
		DPSCommonModule
	],
	providers: [
		DSHuongBaoHiemService
	],
	entryComponents: [
		DSHuongBaoHiemListComponent,
	],
	declarations: [
		DSHuongBaoHiemListComponent,
	],
	exports:[
		DSHuongBaoHiemListComponent,
	]
})
export class DSHuongBaoHiemRefModule { }
