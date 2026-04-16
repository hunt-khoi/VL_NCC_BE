import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { InQuyetDinhComponent } from './in-quyet-dinh.component';
import { InQuyetDinhService } from './Services/in-quyet-dinh.service';

const routes: Routes = [
	{
		path: '',
		component: InQuyetDinhComponent,
		children: [
			{
				path: '',
				component: InQuyetDinhComponent,
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
		InQuyetDinhService
	],
	entryComponents: [
	],
	declarations: [
		InQuyetDinhComponent,
	]
})
export class InQuyetDinhModule { }
