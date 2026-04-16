
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DPSCommonModule } from '../../dps-common.module';
import { XuatHoTroNhaService } from './Services/xuat-da-ho-tro.service';
import { XuatDaHoTroComponent } from './xuat-da-ho-tro.component';

const routes: Routes = [
	{
		path: '',
		component: XuatDaHoTroComponent,
		children: [
			{
				path: '',
				component: XuatDaHoTroComponent,
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
		XuatHoTroNhaService
	],
	entryComponents: [
	],
	declarations: [
		XuatDaHoTroComponent,
	]
})
export class XuatDaHoTroModule { }
