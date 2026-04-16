import { HoSoNhaODuyetDialogComponent } from './ho-so-nha-o-duyet/ho-so-nha-o-duyet-dialog.component';
import { HoSoNhaODuyetListComponent } from './ho-so-nha-o-duyet-list/ho-so-nha-o-duyet-list.component';
import { HoSoNhaODuyetComponent } from './ho-so-nha-o-duyet.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { HoSoNhaODuyetService } from './Services/ho-so-nha-o-duyet.service';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { HoSoNhaORefModule } from '../ho-so-nha-o/ho-so-nha-o-ref.module';
import { HoSoNhaOHoanThienDialogComponent } from './ho-so-nha-o-huong-dan/ho-so-nha-o-huong-dan-dialog.component';
import { HoSoNhaOHDListComponent } from './ho-so-nha-o-hd-list/ho-so-nha-o-hd-list.component';

@NgModule({
	imports: [
		RouterModule,
		DPSCommonModule,
		AngularEditorModule,
		HoSoNhaORefModule
	],
	providers: [
		HoSoNhaODuyetService
	],
	entryComponents: [
		HoSoNhaODuyetComponent,
		HoSoNhaODuyetDialogComponent,
		HoSoNhaOHoanThienDialogComponent,
		HoSoNhaOHDListComponent
	],
	declarations: [
		HoSoNhaODuyetListComponent,
		HoSoNhaODuyetDialogComponent,
		HoSoNhaOHoanThienDialogComponent,
		HoSoNhaOHDListComponent
	],
	exports: [HoSoNhaODuyetListComponent]
})

export class HoSoNhaODuyetRefModule { }