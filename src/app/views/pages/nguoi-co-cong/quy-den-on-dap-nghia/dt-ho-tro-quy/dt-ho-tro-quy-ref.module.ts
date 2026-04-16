import { NgModule } from '@angular/core';
import { dtHoTroServices } from './Services/dt-ho-tro-quy.service';
import { DPSCommonModule } from '../../dps-common.module';
import { DTHoTroEditDialogComponent } from './dt-ho-tro-quy/dt-ho-tro-quy-edit.dialog.component';
import { DTHoTroListComponent } from './dt-ho-tro-quy-list/dt-ho-tro-quy-list.component';
import { DTHoTroHoTroDialogComponent } from './dt-ho-tro-quy-ho-tro/dt-ho-tro-quy-ho-tro.dialog.component';
import { HoTroRefModule } from '../ho-tro/ho-tro-ref.module';
import { DTHoTroTabComponent } from './dt-ho-tro-quy-tab.component';
import { XuatDTDaHoTroComponent } from './xuat-dt-da-ho-tro/xuat-dt-da-ho-tro.component';

@NgModule({
	imports: [
		DPSCommonModule,
		HoTroRefModule
	],
	providers: [
		dtHoTroServices
	],
	entryComponents: [
		DTHoTroTabComponent,
		DTHoTroListComponent,
		XuatDTDaHoTroComponent,
		DTHoTroEditDialogComponent,
		DTHoTroHoTroDialogComponent
	],
	declarations: [
		DTHoTroTabComponent,
		DTHoTroListComponent,
		XuatDTDaHoTroComponent,
		DTHoTroEditDialogComponent,
		DTHoTroHoTroDialogComponent
	],
	exports:[
		DTHoTroListComponent
	]
})
export class dtHoTroRefModule { }
