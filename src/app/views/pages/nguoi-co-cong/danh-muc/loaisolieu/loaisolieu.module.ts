import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { loaisolieuListComponent } from './loaisolieu-list/loaisolieu-list.component';
import { loaisolieuComponent } from './loaisolieu.component';
import { loaisolieuService } from './Services/loaisolieu.service';
import { loaisolieuRefModule } from './loaisolieu-ref.module';
import { DPSCommonModule } from '../../dps-common.module';
const routes: Routes = [
	{
		path: '',
		component: loaisolieuComponent,
		children: [
			{
				path: '',
				component: loaisolieuListComponent,
			},
		]
	}
];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		DPSCommonModule,
        loaisolieuRefModule,
	],
	providers: [
		loaisolieuService
	],
	entryComponents: [
	],
	declarations: [
		loaisolieuComponent,
	]
})
export class loaisolieuModule { }
