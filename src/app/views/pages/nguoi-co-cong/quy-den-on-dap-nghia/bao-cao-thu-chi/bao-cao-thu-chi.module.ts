import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DPSCommonModule } from '../../dps-common.module';
import { BaoCaoThuChiRefModule } from './bao-cao-thu-chi-ref.module';
import { BaoCaoThuChiTabComponent } from './bao-cao-thu-chi-tab.component';
import { BaoCaoThuChiComponent } from './bao-cao-thu-chi.component';

const routes: Routes = [
	{
		path: '',
		component: BaoCaoThuChiComponent,
		children: [
			{
				path: '',
				component: BaoCaoThuChiTabComponent,
			},
		]
	}
];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		DPSCommonModule,
        BaoCaoThuChiRefModule,
	],
	providers: [
		
	],
	entryComponents: [
	],
	declarations: [
		BaoCaoThuChiComponent,
	]
})
export class BaoCaoThuChiModule { }
