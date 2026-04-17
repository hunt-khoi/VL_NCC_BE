import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DeXuatComponent } from './de-xuat.component';
import { DeXuatService } from './Services/de-xuat.service';
import { DPSCommonModule } from '../../dps-common.module';
import { DeXuatDonViComponent } from './de-xuat-don-vi/de-xuat-don-vi.component';

const routes: Routes = [
	{
		path: '',
		component: DeXuatComponent,
		children: [
			{
				path: '',
				component: DeXuatDonViComponent,
			},
			{
				path: ':id',
				loadChildren: () => import('./danh-sach-tang-qua.module').then(m => m.DanhSachTangQuaModule),
			},
		]
	}
];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		DPSCommonModule,
	],
	providers: [
		DeXuatService,
	],
	declarations: [
		DeXuatComponent,
		DeXuatDonViComponent,
	]
})
export class DeXuatModule { }
