import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { nhomletetListComponent } from './nhomletet-list/nhomletet-list.component';
import { nhomletetComponent } from './nhomletet.component';
import { nhomletetService } from './Services/nhomletet.service';
import { nhomletetRefModule } from './nhomletet-ref.module';
import { DPSCommonModule } from '../../dps-common.module';
const routes: Routes = [
	{
		path: '',
		component: nhomletetComponent,
		children: [
			{
				path: '',
				component: nhomletetListComponent,
			},
		]
	}
];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		DPSCommonModule,
        nhomletetRefModule,
	],
	providers: [
		nhomletetService
	],
	entryComponents: [
	],
	declarations: [
		nhomletetComponent,
	]
})
export class nhomletetModule { }
