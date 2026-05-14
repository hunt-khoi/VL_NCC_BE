import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { tracuuHoSoRefModule } from './tra-cuu-ho-so-ref.module';
import { dottangquaService } from '../dot-tang-qua/Services/dot-tang-qua.service';
import { tracuuHoSoComponent } from './tra-cuu-ho-so.component';
import { thongKeTheoDoiTuongComponent } from './tk-theo-doi-tuong/tk-theo-doi-tuong.component';

const routes: Routes = [
	{
		path: '',
		component: tracuuHoSoComponent,
		children: [
			{
				path: '',
				component: thongKeTheoDoiTuongComponent,
			},
		]
	}
];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		DPSCommonModule,
        tracuuHoSoRefModule,
	],
	providers: [
		dottangquaService
	],
	declarations: [
		tracuuHoSoComponent,
	]
})

export class traCuuHoSoModule { }