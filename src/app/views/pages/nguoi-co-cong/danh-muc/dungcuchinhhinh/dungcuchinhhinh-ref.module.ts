import { NgModule } from '@angular/core';

import { dungcuchinhhinhListComponent } from './dungcuchinhhinh-list/dungcuchinhhinh-list.component';
import { dungcuchinhhinhService } from './Services/dungcuchinhhinh.service';
import { DPSCommonModule } from '../../dps-common.module';
import { dungcuchinhhinhEditDialogComponent } from './dungcuchinhhinh-edit/dungcuchinhhinh-edit.dialog.component';

@NgModule({
	imports: [
		DPSCommonModule
	],
	providers: [
		dungcuchinhhinhService
	],
	entryComponents: [
		dungcuchinhhinhListComponent,
		dungcuchinhhinhEditDialogComponent
	],
	declarations: [
		dungcuchinhhinhListComponent,
		dungcuchinhhinhEditDialogComponent
	],
	exports:[
		dungcuchinhhinhListComponent,
	]
})
export class dungcuchinhhinhRefModule { }
