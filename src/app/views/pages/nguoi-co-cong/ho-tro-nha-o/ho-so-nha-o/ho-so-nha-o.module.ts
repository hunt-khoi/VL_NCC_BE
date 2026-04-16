import { HoSoNhaOService } from './Services/ho-so-nha-o.service';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { HoSoNhaOComponent } from './ho-so-nha-o.component';
import { HoSoNhaORefModule } from './ho-so-nha-o-ref.module';
import { HoSoNhaOListComponent } from './ho-so-nha-o-list/ho-so-nha-o-list.component';
import { MatListModule } from '@angular/material';

const routes: Routes = [
	{
		path: '',
		component: HoSoNhaOComponent,
		children: [
			{
				path: '',
				component: HoSoNhaOListComponent
			},
		]
	}
];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		DPSCommonModule,
		HoSoNhaORefModule,
		MatListModule
	],
	providers: [
		HoSoNhaOService,
	],
	entryComponents: [
	],
	declarations: [
		HoSoNhaOComponent,
	],
})
export class HoSoNhaOModule { }
