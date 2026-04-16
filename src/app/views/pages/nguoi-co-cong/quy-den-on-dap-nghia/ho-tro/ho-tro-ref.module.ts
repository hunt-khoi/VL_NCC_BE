import { NgModule } from '@angular/core';
import { HoTroService } from './Services/ho-tro.service';
import { DPSCommonModule } from '../../dps-common.module';
import { HoTroEditDialogComponent } from './ho-tro-edit/ho-tro-edit.dialog.component';
import { dtHoTroServices } from '../dt-ho-tro-quy/Services/dt-ho-tro-quy.service';
import { HoTroPhatEditDialogComponent } from './ho-tro-phat-edit/ho-tro-phat-edit.dialog.component';

@NgModule({
	imports: [
		DPSCommonModule,
	],
	providers: [
		HoTroService,
		dtHoTroServices
	],
	entryComponents: [
		HoTroEditDialogComponent,
		HoTroPhatEditDialogComponent
	],
	declarations: [
		HoTroEditDialogComponent,
		HoTroPhatEditDialogComponent
	],
	exports:[HoTroEditDialogComponent]
})
export class HoTroRefModule { }
