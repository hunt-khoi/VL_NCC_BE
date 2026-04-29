import { NgModule } from '@angular/core';
import { DPSCommonModule } from '../../dps-common.module';
import { loaisolieuService } from './Services/loaisolieu.service';
import { loaisolieuEditDialogComponent } from './loaisolieu-edit/loaisolieu-edit.dialog.component';
import { loaisolieuListComponent } from './loaisolieu-list/loaisolieu-list.component';

@NgModule({
	imports: [
		DPSCommonModule
	],
	providers: [
		loaisolieuService
	],
	entryComponents: [
		loaisolieuListComponent,
		loaisolieuEditDialogComponent
	],
	declarations: [
		loaisolieuListComponent,
		loaisolieuEditDialogComponent
	],
	exports:[
		loaisolieuListComponent,
	]
})

export class loaisolieuRefModule { }