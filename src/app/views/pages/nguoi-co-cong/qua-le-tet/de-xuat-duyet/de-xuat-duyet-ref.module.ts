import { NgModule } from '@angular/core';

import { DeXuatDuyetListComponent } from './de-xuat-duyet-list/de-xuat-duyet-list.component';
import { DeXuatDuyetService } from './Services/de-xuat-duyet.service';
import { DPSCommonModule } from '../../dps-common.module';
import { DeXuatDuyetDialogComponent } from './de-xuat-duyet/de-xuat-duyet.dialog.component';
import { DeXuatRefModule } from '../de-xuat/de-xuat-ref.module';

@NgModule({
	imports: [
		DPSCommonModule,
		DeXuatRefModule
	],
	providers: [
		DeXuatDuyetService
	],
	entryComponents: [
		DeXuatDuyetListComponent,
		DeXuatDuyetDialogComponent,
	],
	declarations: [
		DeXuatDuyetListComponent,
		DeXuatDuyetDialogComponent,
	],
	exports: [
		DeXuatDuyetListComponent,
	]
})
export class DeXuatDuyetRefModule { }
