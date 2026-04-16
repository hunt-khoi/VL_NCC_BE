import { NgModule } from '@angular/core';
import { DPSCommonModule } from '../../dps-common.module';
import { dutoankinhphiListComponent } from './du-toan-kinh-phi-list/du-toan-kinh-phi-list.component';
import { dutoankinhphiService } from './Services/du-toan-kinh-phi.service';
import { dutoankinhphinnewEditDialogComponent } from './du-toan-kinh-phi-new-edit/du-toan-kinh-phi-new-edit.dialog.component';
import { dutoankinhphiEditDialogComponent } from './du-toan-kinh-phi-edit/du-toan-kinh-phi-edit.dialog.component';
import { DuToanKinhPhiImportComponent } from './du-toan-kinh-phi-import/du-toan-kinh-phi-import.component';

@NgModule({
	imports: [
		DPSCommonModule
	],
	providers: [
		dutoankinhphiService
	],
	entryComponents: [
		dutoankinhphiListComponent,
		dutoankinhphinnewEditDialogComponent,
		dutoankinhphiEditDialogComponent,
		DuToanKinhPhiImportComponent
	],
	declarations: [
		dutoankinhphiListComponent,
		dutoankinhphinnewEditDialogComponent,
		dutoankinhphiEditDialogComponent,
		DuToanKinhPhiImportComponent
	],
	exports:[
		dutoankinhphiListComponent,
	]
})
export class dutoankinhphiRefModule { }
