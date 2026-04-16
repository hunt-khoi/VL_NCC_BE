import { HoTroDTDuyetDialogComponent } from './ho-tro-duyet/ho-tro-duyet-dialog.component';
import { HoTroDuyetListComponent } from './ho-tro-duyet-list/ho-tro-duyet-list.component';
import { HoTroDTDuyetComponent } from './ho-tro-duyet.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { HoTroDTDuyetService } from './Services/ho-tro-duyet.service';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { HoTroRefModule } from '../ho-tro/ho-tro-ref.module';
import { HoTroSupDialogComponent } from './ho-tro-sup-edit/ho-tro-sup-edit-dialog.component';

@NgModule({
	imports: [
		RouterModule,
		DPSCommonModule,
		AngularEditorModule,
		HoTroRefModule
	],
	providers: [
		HoTroDTDuyetService
	],
	entryComponents: [
		HoTroDTDuyetComponent,
		HoTroDTDuyetDialogComponent,
		HoTroSupDialogComponent
	],
	declarations: [
		HoTroDuyetListComponent,
		HoTroDTDuyetDialogComponent,
		HoTroSupDialogComponent
	],
	exports: [HoTroDuyetListComponent]
})

export class HoTroDTDuyetRefModule { }