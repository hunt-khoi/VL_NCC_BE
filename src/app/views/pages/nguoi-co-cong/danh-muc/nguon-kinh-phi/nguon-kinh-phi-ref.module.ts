import { NguonKinhPhiEditDialogComponent } from './nguon-kinh-phi-edit/nguon-kinh-phi-edit-dialog.component';
import { NguonKinhPhiListComponent } from './nguon-kinh-phi-list/nguon-kinh-phi-list.component';
import { NguonKinhPhiComponent } from './nguon-kinh-phi.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { NguonKinhPhiService } from '../nguon-kinh-phi/Services/nguon-kinh-phi.service';

@NgModule({
	imports: [
		DPSCommonModule,
	],
	providers: [
		NguonKinhPhiService,
	],
	entryComponents: [
		NguonKinhPhiComponent,
	],
	declarations: [
		NguonKinhPhiListComponent,
		NguonKinhPhiEditDialogComponent
	],
	exports: [NguonKinhPhiListComponent]
})


export class NguonKinhPhiRefModule { }
