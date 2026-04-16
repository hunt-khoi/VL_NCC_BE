import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { NhapNienHanListComponent } from './nhap-nien-han-list/nhap-nien-han-list.component';
import { NhapNienHanComponent } from './nhap-nien-han.component';
import { NhapNienHanService } from './Services/nhap-nien-han.service';
import { DPSCommonModule } from '../../dps-common.module';
import { NienHanRefModule } from '../nien-han/nien-han-ref.module';
import { NienHanService } from '../nien-han/Services/nien-han.service';

const routes: Routes = [
	{
		path: '',
		component: NhapNienHanComponent,
		children: [
			{
				path: '',
				component: NhapNienHanListComponent,
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
		NhapNienHanService,
		NienHanService
	],
	entryComponents: [
		NhapNienHanListComponent,
	],
	declarations: [
		NhapNienHanComponent,
		NhapNienHanListComponent,
	]
})
export class NhapNienHanModule { }
