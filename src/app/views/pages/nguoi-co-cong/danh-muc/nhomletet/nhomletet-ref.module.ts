import { NgModule } from '@angular/core';
import { DPSCommonModule } from '../../dps-common.module';
import { nhomletetService } from './Services/nhomletet.service';
import { nhomletetListComponent } from './nhomletet-list/nhomletet-list.component';
import { nhomletetEditDialogComponent } from './nhomletet-edit/nhomletet-edit.dialog.component';

@NgModule({
	imports: [
		DPSCommonModule
	],
	providers: [
		nhomletetService
	],
	entryComponents: [
		nhomletetListComponent,
		nhomletetEditDialogComponent
	],
	declarations: [
		nhomletetListComponent,
		nhomletetEditDialogComponent
	],
	exports:[
		nhomletetListComponent,
	]
})

export class nhomletetRefModule { }