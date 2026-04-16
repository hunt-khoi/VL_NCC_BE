import { HoTroDTDuyetService } from './Services/ho-tro-duyet.service';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { HoTroDTDuyetComponent } from './ho-tro-duyet.component'
import { HoTroDTDuyetRefModule } from './ho-tro-duyet-ref.module';
import { HoTroDTDuyetPageComponent } from './ho-tro-duyet-page/ho-tro-duyet-page.component';
import { HoTroDuyetListComponent } from './ho-tro-duyet-list/ho-tro-duyet-list.component';

const routes: Routes = [
	{
		path: '',
		component: HoTroDTDuyetComponent,
		children: [
			{
				path: '',
				component: HoTroDuyetListComponent,
			},
			{
				path: 'ho-tro-list/:id',
				component: HoTroDTDuyetPageComponent,
			},
		]
	}
];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		DPSCommonModule,
		HoTroDTDuyetRefModule,
	],
	providers: [
		HoTroDTDuyetService,
	],
	entryComponents: [
	],
	declarations: [
		HoTroDTDuyetPageComponent,
		HoTroDTDuyetComponent,
	],
})
export class HoTroDTuyetModule { }
