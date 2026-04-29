import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { nhomletetComponent } from './nhomletet.component';
import { nhomletetService } from './Services/nhomletet.service';
import { nhomletetRefModule } from './nhomletet-ref.module';
import { nhomletetListComponent } from './nhomletet-list/nhomletet-list.component';

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
	declarations: [
		nhomletetComponent,
	]
})

export class nhomletetModule { }