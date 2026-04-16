import { NgModule } from '@angular/core';
import { DPSCommonModule } from '../../dps-common.module';
import { NienHanRefModule } from '../nien-han/nien-han-ref.module';
import { NienHanDuyetService } from './Services/nien-han-duyet.service';
import { NienHanDuyetListComponent } from './nien-han-duyet-list/nien-han-duyet-list.component';
import { NienHanDuyetDialogComponent } from './nien-han-duyet/nien-han-duyet.dialog.component';
import { NienHanHuyenDuyetListComponent } from './nien-han-huyen-duyet-list/nien-han-huyen-duyet-list.component';
import { NienHanXaDuyetListComponent } from './nien-han-xa-duyet-list/nien-han-xa-duyet-list.component';
import { NhacNhoNienHanComponent } from './nhac-nho-nien-han/nhac-nho-nien-han.component';

@NgModule({
	imports: [
		DPSCommonModule,
		NienHanRefModule
	],
	providers: [
		NienHanDuyetService
	],
	entryComponents: [
		NienHanDuyetListComponent,
		NienHanHuyenDuyetListComponent,
		NienHanXaDuyetListComponent,
		NienHanDuyetDialogComponent,
		NhacNhoNienHanComponent
	],
	declarations: [
		NienHanDuyetListComponent,
		NienHanHuyenDuyetListComponent,
		NienHanXaDuyetListComponent,
		NienHanDuyetDialogComponent,
		NhacNhoNienHanComponent
	],
	exports: [
		NienHanDuyetListComponent,
		NienHanHuyenDuyetListComponent,
		NienHanXaDuyetListComponent,
		NhacNhoNienHanComponent
	]
})
export class NienHanDuyetRefModule { }
