import { NgModule } from '@angular/core';

import { NienHanService } from './Services/nien-han.service';
import { DPSCommonModule } from '../../dps-common.module';
import { NienHanEditDialogComponent } from './nien-han-edit/nien-han-edit.dialog.component';
import { DoiTuongTrangCapRefModule } from '../doi-tuong-trang-cap/doi-tuong-trang-cap-ref.module';
import { QuyetDinhCapTienDialogComponent } from './quyet-dinh-cap-tien/quyet-dinh-cap-tien-dialog.component';

@NgModule({
	imports: [
		DPSCommonModule,
		DoiTuongTrangCapRefModule
	],
	providers: [
		NienHanService
	],
	entryComponents: [
		NienHanEditDialogComponent,
		QuyetDinhCapTienDialogComponent
	],
	declarations: [
		NienHanEditDialogComponent,
		QuyetDinhCapTienDialogComponent
	],
	exports:[ 
	]
})
export class NienHanRefModule { }
