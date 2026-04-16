import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { dottangquaListComponent } from './dot-tang-qua-list/dot-tang-qua-list.component';
import { dottangquaComponent } from './dot-tang-qua.component';
import { dottangquaService } from './Services/dot-tang-qua.service';
import { dottangquaRefModule } from './dot-tang-qua-ref.module';
import { DPSCommonModule } from '../../dps-common.module';
const routes: Routes = [
	{
		path: '',
		component: dottangquaComponent,
		children: [
			{
				path: '',
				component: dottangquaListComponent,
			},
		]
	}
];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		DPSCommonModule,
        dottangquaRefModule,
	],
	providers: [
		dottangquaService
	],
	entryComponents: [
	],
	declarations: [
		dottangquaComponent,
	]
})
export class dottangquaModule { }
