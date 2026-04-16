import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DPSCommonModule } from '../../dps-common.module';
import { ThongKeHoTroRefModule } from './thong-ke-ho-tro-ref.module';
import { ThongKeHoTroTabComponent } from './thong-ke-ho-tro-tab.component';
import { ThongKeHoTroComponent } from './thong-ke-ho-tro.component';

const routes: Routes = [
	{
		path: '',
		component: ThongKeHoTroComponent,
		children: [
			{
				path: '',
				component: ThongKeHoTroTabComponent,
			},
		]
	}
];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		DPSCommonModule,
        ThongKeHoTroRefModule,
	],
	providers: [
		
	],
	entryComponents: [
	],
	declarations: [
		ThongKeHoTroComponent,
	]
})
export class ThongKeHoTroModule { }
