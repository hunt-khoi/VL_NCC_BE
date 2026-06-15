import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { DeXuatRefModule } from '../de-xuat/de-xuat-ref.module';
import { DeXuatDuyetService } from './Services/de-xuat-duyet.service';
import { DeXuatDuyetComponent } from './de-xuat-duyet.component';
import { DeXuatDuyetListComponent } from './de-xuat-duyet-list/de-xuat-duyet-list.component';
import { DuyetDeXuatPageComponent } from './duyet-de-xuat-page/duyet-de-xuat-page.component';
import { DeXuatTongHopDialogComponent } from './de-xuat-tong-hop/de-xuat-tong-hop.dialog.component';
import { DeXuatDuyetDialogComponent } from './de-xuat-duyet/de-xuat-duyet.dialog.component';

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
        DeXuatRefModule,
    ],
    providers: [
        DeXuatDuyetService
    ],
    declarations: [
        DeXuatDuyetComponent,
        DuyetDeXuatPageComponent,
        DeXuatTongHopDialogComponent,
        DeXuatDuyetListComponent,
        DeXuatDuyetDialogComponent
    ]
})

export class DeXuatDuyetModule { }