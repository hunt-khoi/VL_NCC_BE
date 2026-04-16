import { MauSoLieuService } from './Services/mau-so-lieu.service';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { MauSoLieuListComponent } from './mau-so-lieu-list/mau-so-lieu-list.component';
import { MauSoLieuRefModule } from './mau-so-lieu-ref.module';
import { MauSoLieuComponent } from './mau-so-lieu.component';
import { solieuService } from '../../danh-muc/solieu/Services/solieu.service';

const routes: Routes = [
	{
		path: '',
		component: MauSoLieuComponent,
		children: [
			{
				path: '',
				component: MauSoLieuListComponent,
			},
			{
				path: 'cap-nhat-theo-nam',
				component: MauSoLieuListComponent
			},
		]
	}
];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		DPSCommonModule,
		MauSoLieuRefModule,
	],
	providers: [
		MauSoLieuService,
		solieuService

	],
	entryComponents: [
	],
	declarations: [
		MauSoLieuComponent
	]
})
export class MauSoLieuModule { }
