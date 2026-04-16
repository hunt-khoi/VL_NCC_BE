import { NgModule } from '@angular/core';
import { dotnienhanListComponent } from './dot-nien-han-list/dot-nien-han-list.component';
import { dotnienhanService } from './Services/dot-nien-han.service';
import { DPSCommonModule } from '../../dps-common.module';
import { dotnienhanEditDialogComponent } from './dot-nien-han-edit/dot-nien-han-edit.dialog.component';

@NgModule({
	imports: [
		DPSCommonModule
	],
	providers: [
		dotnienhanService
	],
	entryComponents: [
		dotnienhanListComponent,
		dotnienhanEditDialogComponent,
	],
	declarations: [
		dotnienhanListComponent,
		dotnienhanEditDialogComponent,
	],
	exports:[
		dotnienhanListComponent,
	]
})
export class dotnienhanRefModule { }
