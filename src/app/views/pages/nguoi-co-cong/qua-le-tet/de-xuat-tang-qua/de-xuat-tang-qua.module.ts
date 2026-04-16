import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DeXuatTQListComponent } from './de-xuat-tang-qua-list/de-xuat-tang-qua-list.component';
import { DeXuatTangQuaComponent } from './de-xuat-tang-qua.component';
import { DeXuatTangQuaService } from './Services/de-xuat-tang-qua.service';
import { DPSCommonModule } from '../../dps-common.module';
import { DeXuatService } from '../de-xuat/Services/de-xuat.service';
import { DeXuatRefModule } from '../de-xuat/de-xuat-ref.module';
//import { DeXuatDonViComponent } from './de-xuat-don-vi/de-xuat-don-vi.component';

const routes: Routes = [
	{
		path: '',
		component: DeXuatTangQuaComponent,
		children: [
			{
				path: '',
				component: DeXuatTQListComponent,
			},
		]
	}
];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		DPSCommonModule,
		DeXuatRefModule,
	],
	providers: [
		DeXuatTangQuaService,
		DeXuatService
	],
	entryComponents: [
		DeXuatTQListComponent,
	],
	declarations: [
		DeXuatTangQuaComponent,
		DeXuatTQListComponent,
	]
})
export class DeXuatTangQuaModule { }
