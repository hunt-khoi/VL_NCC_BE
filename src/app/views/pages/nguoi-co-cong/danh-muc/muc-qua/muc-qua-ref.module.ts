import { NgModule } from '@angular/core';
import { DPSCommonModule } from '../../dps-common.module';
import { MucQuaService } from '../muc-qua/Services/muc-qua.service';
import { MucQuaComponent } from './muc-qua.component';
import { MucQuaListComponent } from './muc-qua-list/muc-qua-list.component';
import { MucQuaEditDialogComponent } from './muc-qua-edit/muc-qua-edit-dialog.component';

@NgModule({
	imports: [
		DPSCommonModule,
	],
	providers: [
		MucQuaService,
	],
	entryComponents: [
		MucQuaComponent,
	],
	declarations: [
		MucQuaListComponent,
		MucQuaEditDialogComponent
	],
	exports: [MucQuaListComponent]
})

export class MucQuaRefModule { }