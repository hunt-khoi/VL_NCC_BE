import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DPSCommonModule } from '../../dps-common.module';
import { BaoCaoVanDongRefModule } from './bao-cao-van-dong-ref.module';
import { BaoCaoVanDongTabComponent } from './bao-cao-van-dong-tab.component';
import { BaoCaoVanDongComponent } from './bao-cao-van-dong.component';

const routes: Routes = [
	{
		path: '',
		component: BaoCaoVanDongComponent,
		children: [
			{
				path: '',
				component: BaoCaoVanDongTabComponent,
			},
		]
	}
];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		DPSCommonModule,
        BaoCaoVanDongRefModule,
	],
	providers: [
		
	],
	entryComponents: [
	],
	declarations: [
		BaoCaoVanDongComponent,
	]
})
export class BaoCaoVanDongModule { }
