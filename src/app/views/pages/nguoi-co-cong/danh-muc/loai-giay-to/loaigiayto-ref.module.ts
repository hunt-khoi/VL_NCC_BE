import { NgModule } from '@angular/core';
import { DPSCommonModule } from '../../dps-common.module';
import { loaiGiayToServices } from './Services/loaigiayto.service';
import { LoaiGiayToListComponent } from './loaigiayto-list/loaigiayto-list.component';
import { LoaiGiayToEditDialogComponent } from './loaigiayto-edit/loaigiayto-edit.dialog.component';

@NgModule({
	imports: [
		DPSCommonModule,
	],
	providers: [
		loaiGiayToServices
	],
	entryComponents: [
		LoaiGiayToListComponent
	],
	declarations: [
		LoaiGiayToListComponent,
		LoaiGiayToEditDialogComponent,
	],
	exports:[
		LoaiGiayToListComponent
	]
})

export class loaiGiayToRefModule { }