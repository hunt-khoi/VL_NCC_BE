import { GiayToService } from './../giay-to/Services/giay-to.service';
import { HoSoNCCDuyetService } from './Services/ho-so-ncc-duyet.service';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { HoSoNCCDuyetComponent } from './ho-so-ncc-duyet.component';
import { HoSoNCCDuyetRefModule } from './ho-so-ncc-duyet-ref.module';
import { HoSoNCCDuyetListComponent } from './ho-so-ncc-duyet-list/ho-so-ncc-duyet-list.component';
import { ThanNhanService } from '../than-nhan/Services/than-nhan.service';
import { HoSoNCCDuyetPageComponent } from './ho-so-ncc-duyet-page/ho-so-ncc-duyet-page.component';

const routes: Routes = [
	{
		path: '',
		component: HoSoNCCDuyetComponent,
		children: [
			{
				path: '',
				component: HoSoNCCDuyetListComponent,
			},
			{
				path: 'ho-so/:id',
				component: HoSoNCCDuyetPageComponent,
			},
		]
	}
];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		DPSCommonModule,
		HoSoNCCDuyetRefModule,
	],
	providers: [
		HoSoNCCDuyetService,
		ThanNhanService,
		GiayToService,
	],
	entryComponents: [
	],
	declarations: [
		HoSoNCCDuyetPageComponent,
		HoSoNCCDuyetComponent,
	],
})
export class HoSoNCCDuyetModule { }
