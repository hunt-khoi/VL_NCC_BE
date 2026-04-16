import { NgModule } from '@angular/core';
import { LoaiGiayToListComponent } from './loaigiayto-list/loaigiayto-list.component';
import { loaiGiayToServices } from './Services/loaigiayto.service';
import { DPSCommonModule } from '../../dps-common.module';
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
