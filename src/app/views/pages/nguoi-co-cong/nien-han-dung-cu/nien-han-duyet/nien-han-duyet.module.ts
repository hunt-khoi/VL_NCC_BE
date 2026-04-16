import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { NienHanDuyetListComponent } from './nien-han-duyet-list/nien-han-duyet-list.component';
import { NienHanDuyetComponent } from './nien-han-duyet.component';
import { NienHanDuyetService } from './Services/nien-han-duyet.service';
import { NienHanDuyetRefModule } from './nien-han-duyet-ref.module';
import { DPSCommonModule } from '../../dps-common.module';
import { DuyetNienHanPageComponent } from './duyet-nien-han-page/duyet-nien-han-page.component';
// import { DeXuatTongHopDialogComponent } from './de-xuat-tong-hop/de-xuat-tong-hop.dialog.component';

const routes: Routes = [
	{
		path: '',
		component: NienHanDuyetComponent,
		children: [
			{
				path: '',
				component: NienHanDuyetListComponent,
			},
			{
				path: 'nien-han/:id/:isxa',
				component: DuyetNienHanPageComponent,
			},
		]
	}
];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		DPSCommonModule,
		NienHanDuyetRefModule,
	],
	providers: [
		NienHanDuyetService
	],
	entryComponents: [
		// DeXuatTongHopDialogComponent
	],
	declarations: [
		NienHanDuyetComponent,
		DuyetNienHanPageComponent
		// DeXuatTongHopDialogComponent
	]
})
export class NienHanDuyetModule { }
