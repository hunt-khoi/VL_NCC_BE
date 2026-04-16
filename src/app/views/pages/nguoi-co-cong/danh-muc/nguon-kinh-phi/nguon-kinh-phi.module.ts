import { NguonKinhPhiService } from './Services/nguon-kinh-phi.service';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { NguonKinhPhiEditDialogComponent } from './nguon-kinh-phi-edit/nguon-kinh-phi-edit-dialog.component';
import { NguonKinhPhiListComponent } from './nguon-kinh-phi-list/nguon-kinh-phi-list.component';
import { NguonKinhPhiRefModule } from './nguon-kinh-phi-ref.module';
import { NguonKinhPhiComponent } from './nguon-kinh-phi.component';


const routes: Routes = [
	{
		path: '',
		component: NguonKinhPhiComponent,
		children: [
			{
				path: '',
				component: NguonKinhPhiListComponent,
			},
			{
				path: 'themmoi',
				component: NguonKinhPhiEditDialogComponent,
			},
			{
				path: 'chinhsua/:id',
				component: NguonKinhPhiEditDialogComponent,
			},
		]
	}
];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		DPSCommonModule,
		NguonKinhPhiRefModule,
	],
	providers: [
		NguonKinhPhiService
	],
	entryComponents: [
	],
	declarations: [
		NguonKinhPhiComponent
	]
})
export class NguonKinhPhiModule { }
