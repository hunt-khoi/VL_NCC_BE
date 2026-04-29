import { NgModule } from '@angular/core';
import { DPSCommonModule } from '../../dps-common.module';
import { NguonKinhPhiService } from '../nguon-kinh-phi/Services/nguon-kinh-phi.service';
import { NguonKinhPhiComponent } from './nguon-kinh-phi.component';
import { NguonKinhPhiListComponent } from './nguon-kinh-phi-list/nguon-kinh-phi-list.component';
import { NguonKinhPhiEditDialogComponent } from './nguon-kinh-phi-edit/nguon-kinh-phi-edit-dialog.component';

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