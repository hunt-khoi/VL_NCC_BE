import { NgModule } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { solieuComponent } from './solieu.component';
import { solieuRefModule } from './solieu-ref.module';
import { solieuListComponent } from './solieu-list/solieu-list.component';
import { PhiSoLieuServices } from '../phi-so-lieu/Services/phi-so-lieu.service';
import { PhiSoLieuRefModule } from '../phi-so-lieu/phi-so-lieu-ref.module';

const routes: Routes = [
	{
		path: '',
		component: solieuComponent,
		children: [
			{
				path: '',
				component: solieuListComponent,
			},
		]
	}
];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		DPSCommonModule,
		solieuRefModule,
		PhiSoLieuRefModule,
	],
	providers: [
		DatePipe,
        PhiSoLieuServices,
	],
	declarations: [
		solieuComponent,
	]
})

export class solieuModule { }