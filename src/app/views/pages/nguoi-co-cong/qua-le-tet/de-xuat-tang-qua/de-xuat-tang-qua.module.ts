import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { DeXuatRefModule } from '../de-xuat/de-xuat-ref.module';
import { DeXuatService } from '../de-xuat/Services/de-xuat.service';
import { DeXuatTangQuaService } from './Services/de-xuat-tang-qua.service';
import { DeXuatTangQuaComponent } from './de-xuat-tang-qua.component';
import { DeXuatTQListComponent } from './de-xuat-tang-qua-list/de-xuat-tang-qua-list.component';

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