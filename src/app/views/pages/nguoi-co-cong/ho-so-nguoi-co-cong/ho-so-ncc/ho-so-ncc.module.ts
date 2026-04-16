import { GiayToService } from './../giay-to/Services/giay-to.service';
import { HoSoNCCService } from './Services/ho-so-ncc.service';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { HoSoNCCComponent } from './ho-so-ncc.component';
import { HoSoNCCRefModule } from './ho-so-ncc-ref.module';
import { HoSoNCCListComponent } from './ho-so-ncc-list/ho-so-ncc-list.component';
import { ThanNhanService } from '../than-nhan/Services/than-nhan.service';
import { QuyetDinhRefModule } from '../quyet-dinh/quyet-dinh-ref.module';
import { HoSoNCCEditPageComponent } from './ho-so-ncc-edit-page/ho-so-ncc-edit-page.component';

const routes: Routes = [
	{
		path: '',
		component: HoSoNCCComponent,
		children: [
			{
				path: '',
				// loadChildren: () => import('./ho-so-ncc-list/ho-so-ncc-list.component').then(m => m.HoSoNCCListComponent)
				component: HoSoNCCListComponent
			},
			{
				path: 'them-ho-so',
				// loadChildren: () => import('./ho-so-ncc-edit-page/ho-so-ncc-edit-page.component').then(m => m.HoSoNCCEditPageComponent)
				component: HoSoNCCEditPageComponent
			}
		]
	}
];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		DPSCommonModule,
		HoSoNCCRefModule,
		QuyetDinhRefModule
	],
	providers: [
		HoSoNCCService,
		ThanNhanService,
		GiayToService,
	],
	entryComponents: [
	],
	declarations: [
		HoSoNCCComponent,
		HoSoNCCEditPageComponent
	],
})
export class HoSoNCCModule { }
