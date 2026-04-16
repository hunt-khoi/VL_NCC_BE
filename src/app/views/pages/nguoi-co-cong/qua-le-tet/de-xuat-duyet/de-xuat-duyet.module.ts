import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DeXuatDuyetListComponent } from './de-xuat-duyet-list/de-xuat-duyet-list.component';
import { DeXuatDuyetComponent } from './de-xuat-duyet.component';
import { DeXuatDuyetService } from './Services/de-xuat-duyet.service';
import { DeXuatDuyetRefModule } from './de-xuat-duyet-ref.module';
import { DPSCommonModule } from '../../dps-common.module';
import { DuyetDeXuatPageComponent } from './duyet-de-xuat-page/duyet-de-xuat-page.component';
import { DeXuatTongHopDialogComponent } from './de-xuat-tong-hop/de-xuat-tong-hop.dialog.component';
const routes: Routes = [
	{
		path: '',
		component: DeXuatDuyetComponent,
		children: [
			{
				path: '',
				component: DeXuatDuyetListComponent,
			},
			{
				path: 'de-xuat/:id',
				component: DuyetDeXuatPageComponent,
			},
		]
	}
];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		DPSCommonModule,
		DeXuatDuyetRefModule,
	],
	providers: [
		DeXuatDuyetService
	],
	entryComponents: [
		DeXuatTongHopDialogComponent
	],
	declarations: [
		DeXuatDuyetComponent,
		DuyetDeXuatPageComponent,
		DeXuatTongHopDialogComponent
	]
})
export class DeXuatDuyetModule { }
