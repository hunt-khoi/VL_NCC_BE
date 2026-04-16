import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { dotnienhanListComponent } from './dot-nien-han-list/dot-nien-han-list.component';
import { dotnienhanComponent } from './dot-nien-han.component';
import { dotnienhanService } from './Services/dot-nien-han.service';
import { dotnienhanRefModule } from './dot-nien-han-ref.module';
import { DPSCommonModule } from '../../dps-common.module';
const routes: Routes = [
	{
		path: '',
		component: dotnienhanComponent,
		children: [
			{
				path: '',
				component: dotnienhanListComponent,
			},
		]
	}
];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		DPSCommonModule,
        dotnienhanRefModule,
	],
	providers: [
		dotnienhanService
	],
	entryComponents: [
	],
	declarations: [
		dotnienhanComponent,
	]
})
export class dotnienhanModule { }
