import { HoSoNhaODuyetService } from './Services/ho-so-nha-o-duyet.service';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { HoSoNhaODuyetComponent } from './ho-so-nha-o-duyet.component';
import { HoSoNhaODuyetRefModule } from './ho-so-nha-o-duyet-ref.module';
import { HoSoNhaODuyetListComponent } from './ho-so-nha-o-duyet-list/ho-so-nha-o-duyet-list.component';
import { HoSoNhaODuyetPageComponent } from './ho-so-nha-o-duyet-page/ho-so-nha-o-duyet-page.component';

const routes: Routes = [
	{
		path: '',
		component: HoSoNhaODuyetComponent,
		children: [
			{
				path: '',
				component: HoSoNhaODuyetListComponent,
			},
			{
				path: 'ho-so-nha/:id',
				component: HoSoNhaODuyetPageComponent,
			},
		]
	}
];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		DPSCommonModule,
		HoSoNhaODuyetRefModule,
	],
	providers: [
		HoSoNhaODuyetService,
	],
	entryComponents: [
	],
	declarations: [
		HoSoNhaODuyetPageComponent,
		HoSoNhaODuyetComponent,
	],
})
export class HoSoNhaODuyetModule { }
