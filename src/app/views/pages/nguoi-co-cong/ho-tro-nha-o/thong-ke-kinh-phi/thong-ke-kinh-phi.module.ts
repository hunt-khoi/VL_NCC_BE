import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DPSCommonModule } from '../../dps-common.module';
import { ThongKeKinhPhiService } from './Services/thong-ke-kinh-phi.service';
import { ThongKeKinhPhiDialogComponent } from './thong-ke-kinh-phi-dialog/thong-ke-kinh-phi-dialog.component';
import { ThongKeKinhPhiComponent } from './thong-ke-kinh-phi.component';

const routes: Routes = [
	{
		path: '',
		component: ThongKeKinhPhiComponent,
		children: [
			{
				path: '',
				component: ThongKeKinhPhiComponent,
			},
		]
	}
];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		DPSCommonModule,
	],
	providers: [
		ThongKeKinhPhiService
	],
	entryComponents: [
		ThongKeKinhPhiDialogComponent,
	],
	declarations: [
		ThongKeKinhPhiComponent,
		ThongKeKinhPhiDialogComponent
	]
})
export class ThongKeKinhPhiModule { }
