import { NgModule } from '@angular/core';

import { DPSCommonModule } from '../../dps-common.module';
import { QuyetDinhService } from './Services/quyet-dinh.service';
import { QuyetDinhEditDialogComponent } from './quyet-dinh-edit/quyet-dinh-edit-dialog.component';

@NgModule({
	imports: [
		DPSCommonModule
	],
	providers: [
		QuyetDinhService
	],
	entryComponents: [
		QuyetDinhEditDialogComponent
	],
	declarations: [
		QuyetDinhEditDialogComponent
	],
	exports: [
		QuyetDinhEditDialogComponent
	]
})
export class QuyetDinhRefModule { }
