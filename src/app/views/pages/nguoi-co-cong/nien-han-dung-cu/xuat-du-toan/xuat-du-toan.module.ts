
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DPSCommonModule } from '../../dps-common.module';
import { xuatDuToanService } from './Services/xuat-du-toan.service';
import { xuatDuToanComponent } from './xuat-du-toan.component';

const routes: Routes = [
	{
		path: '',
		component: xuatDuToanComponent,
		children: [
			{
				path: '',
				component: xuatDuToanComponent,
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
		xuatDuToanService
	],
	entryComponents: [
	],
	declarations: [
		xuatDuToanComponent,
	]
})
export class xuatDuToanModule { }
