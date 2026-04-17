import { GiayToService } from './../giay-to/Services/giay-to.service';
import { HoSoNCCService } from './Services/ho-so-ncc.service';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { HoSoNCCComponent } from './ho-so-ncc.component';
import { HoSoNCCListComponent } from './ho-so-ncc-list/ho-so-ncc-list.component';
import { HoSoNCCImportComponent } from './ho-so-ncc-import/ho-so-ncc-import.component';
import { ThanNhanService } from '../than-nhan/Services/than-nhan.service';
import { QuyetDinhRefModule } from '../quyet-dinh/quyet-dinh-ref.module';

const routes: Routes = [
	{
		path: '',
		component: HoSoNCCComponent,
		children: [
			{
				path: '',
				component: HoSoNCCListComponent
			},
			{
				path: 'them-ho-so',
				loadChildren: () => import('./ho-so-ncc-edit.module').then(m => m.HoSoNCCEditModule)
			}
		]
	}
];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		DPSCommonModule,
		QuyetDinhRefModule,
	],
	providers: [
		HoSoNCCService,
		ThanNhanService,
		GiayToService,
	],
	entryComponents: [
		HoSoNCCImportComponent,
	],
	declarations: [
		HoSoNCCComponent,
		HoSoNCCListComponent,
		HoSoNCCImportComponent,
	],
})
export class HoSoNCCModule { }
