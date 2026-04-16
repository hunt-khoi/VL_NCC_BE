import { MucQuaEditDialogComponent } from './muc-qua-edit/muc-qua-edit-dialog.component';
import { MucQuaListComponent } from './muc-qua-list/muc-qua-list.component';
import { MucQuaComponent } from './muc-qua.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { MucQuaService } from '../muc-qua/Services/muc-qua.service';

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
