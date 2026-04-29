import { NgModule } from '@angular/core';
import { DPSCommonModule } from '../../dps-common.module';
import { dungcuchinhhinhService } from './Services/dungcuchinhhinh.service';
import { dungcuchinhhinhListComponent } from './dungcuchinhhinh-list/dungcuchinhhinh-list.component';
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