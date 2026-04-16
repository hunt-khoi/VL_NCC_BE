import { NgModule } from '@angular/core';

import { nhomletetListComponent } from './nhomletet-list/nhomletet-list.component';
import { nhomletetService } from './Services/nhomletet.service';
import { DPSCommonModule } from '../../dps-common.module';
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
