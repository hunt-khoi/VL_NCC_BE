import { HoSoNhaOEditDialogComponent } from './ho-so-nha-o-edit/ho-so-nha-o-edit-dialog.component';
import { HoSoNhaOListComponent } from './ho-so-nha-o-list/ho-so-nha-o-list.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { HoSoNhaOService } from './Services/ho-so-nha-o.service';
import { HoSoNhaOImportComponent } from './ho-so-nha-o-import/ho-so-nha-o-import.component';
import { HoSoNhaOSupportDialogComponent } from './ho-so-nha-o-support/ho-so-nha-o-support-dialog.component';
import { HoSoNhaOHistoryComponent } from './ho-so-nha-o-history/ho-so-nha-o-history.component';
import { HoSoNhaOSupportsDialogComponent } from './ho-tro-nha-o-supports/ho-tro-nha-o-supports-dialog.component';

@NgModule({
	imports: [
		RouterModule,
		DPSCommonModule
	],
	providers: [
		HoSoNhaOService,
	],
	entryComponents: [
		HoSoNhaOImportComponent,
		HoSoNhaOEditDialogComponent,
		HoSoNhaOSupportDialogComponent,
		HoSoNhaOSupportsDialogComponent,
		HoSoNhaOHistoryComponent
	],
	declarations: [
		HoSoNhaOListComponent,
		HoSoNhaOEditDialogComponent,
		HoSoNhaOImportComponent,
		HoSoNhaOSupportDialogComponent,
		HoSoNhaOSupportsDialogComponent,
		HoSoNhaOHistoryComponent
	],
	exports: [
		HoSoNhaOListComponent,
		HoSoNhaOSupportDialogComponent,
		HoSoNhaOSupportsDialogComponent,
		HoSoNhaOHistoryComponent
	]
})

export class HoSoNhaORefModule { }
