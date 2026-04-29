import { NgModule } from '@angular/core';
import { DPSCommonModule } from '../../dps-common.module';
import { PhiSoLieuServices } from './Services/phi-so-lieu.service';
import { PhiSoLieuListComponent } from './phi-so-lieu-list/phi-so-lieu-list.component';
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
