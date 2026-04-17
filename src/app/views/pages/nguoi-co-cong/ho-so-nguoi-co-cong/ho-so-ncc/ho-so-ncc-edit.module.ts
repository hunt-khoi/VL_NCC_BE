import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { HoSoNCCRefModule } from './ho-so-ncc-ref.module';
import { QuyetDinhRefModule } from '../quyet-dinh/quyet-dinh-ref.module';
import { HoSoNCCEditPageComponent } from './ho-so-ncc-edit-page/ho-so-ncc-edit-page.component';

const routes: Routes = [
	{ path: '', component: HoSoNCCEditPageComponent }
];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		DPSCommonModule,
		HoSoNCCRefModule,
		QuyetDinhRefModule,
	],
	declarations: [
		HoSoNCCEditPageComponent,
	],
})
export class HoSoNCCEditModule { }