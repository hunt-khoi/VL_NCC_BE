import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { dutoankinhphiListComponent } from './du-toan-kinh-phi-list/du-toan-kinh-phi-list.component';
import { dutoankinhphiComponent } from './du-toan-kinh-phi.component';
import { dutoankinhphiService } from './Services/du-toan-kinh-phi.service';
import { dutoankinhphiRefModule } from './du-toan-kinh-phi-ref.module';
import { DPSCommonModule } from '../../dps-common.module';
const routes: Routes = [
	{
		path: '',
		component: dutoankinhphiComponent,
		children: [
			{
				path: '',
				component: dutoankinhphiListComponent,
			},
		]
	}
];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		DPSCommonModule,
        dutoankinhphiRefModule,
	],
	providers: [
		dutoankinhphiService
	],
	entryComponents: [
	],
	declarations: [
		dutoankinhphiComponent,
	]
})
export class dutoankinhphiModule { }
