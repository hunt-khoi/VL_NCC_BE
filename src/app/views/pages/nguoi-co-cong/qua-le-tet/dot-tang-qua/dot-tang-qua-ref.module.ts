import { NgModule } from '@angular/core';
import { DPSCommonModule } from '../../dps-common.module';
import { dottangquaListComponent } from './dot-tang-qua-list/dot-tang-qua-list.component';
import { dottangquaService } from './Services/dot-tang-qua.service';
import { dottangquannewEditDialogComponent } from './dot-tang-qua-new-edit/dot-tang-qua-new-edit.dialog.component';
import { dottangquaEditDialogComponent } from './dot-tang-qua-edit/dot-tang-qua-edit.dialog.component';
import { SoToTrinhEditDialogComponent } from './so-to-trinh-edit/so-to-trinh-edit.dialog.component';

@NgModule({
	imports: [
		DPSCommonModule
	],
	providers: [
		dottangquaService
	],
	entryComponents: [
		dottangquaListComponent,
		dottangquannewEditDialogComponent,
		dottangquaEditDialogComponent,
		SoToTrinhEditDialogComponent
	],
	declarations: [
		dottangquaListComponent,
		dottangquannewEditDialogComponent,
		dottangquaEditDialogComponent,
		SoToTrinhEditDialogComponent
	],
	exports:[
		dottangquaListComponent,
	]
})
export class dottangquaRefModule { }
