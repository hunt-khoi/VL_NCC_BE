import { NgModule } from '@angular/core';
import { PhiSoLieuListComponent } from './phi-so-lieu-list/phi-so-lieu-list.component';
import {PhiSoLieuServices } from './Services/phi-so-lieu.service';
import { DPSCommonModule } from '../../dps-common.module';
import { PhiSoLieuDialogComponent } from './phi-so-lieu-edit/phi-so-lieu-edit.dialog.component';


@NgModule({
	imports: [
		DPSCommonModule,
	],
	providers: [
		PhiSoLieuServices
	],
	entryComponents: [
		PhiSoLieuListComponent,
		PhiSoLieuDialogComponent
	],
	declarations: [
		PhiSoLieuListComponent,
		PhiSoLieuDialogComponent,
	],
	exports:[
		PhiSoLieuListComponent
	]
})
export class PhiSoLieuRefModule { }
