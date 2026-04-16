import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DPSCommonModule } from '../../dps-common.module';
import { NienHanHuyenListComponent } from './nien-han-huyen-list/nien-han-huyen-list.component';
import { NienHanXaListComponent } from './nien-han-xa-list/nien-han-xa-list.component';
import { NienHanComponent } from './nien-han.component';
import { NienHanService } from './Services/nien-han.service';
import { NienHanRefModule } from './nien-han-ref.module';
import { NienHanListComponent } from './nien-han-list/nien-han-list.component';
import { TroCapTienListComponent } from './tro-cap-tien-list/tro-cap-tien-list.component';

const routes: Routes = [
	{
		path: '',
		component: NienHanComponent,
		children: [
			{
				path: '',
				component: NienHanListComponent,
			},
			{
				path: ':id',
				component: TroCapTienListComponent,
			},
		]
	}
];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		DPSCommonModule,
		NienHanRefModule,
	],
	providers: [
		NienHanService,
	],
	entryComponents: [
	],
	declarations: [
		NienHanComponent,
		NienHanListComponent,
		NienHanHuyenListComponent,
		NienHanXaListComponent,
		TroCapTienListComponent
	]
})
export class NienHanModule { }
