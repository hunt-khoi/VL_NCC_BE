import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { BaoCaoTinhHinhComponent } from './bao-cao-tinh-hinh.component';
import { BaoCaoTinhHinhService } from './Services/bao-cao-tinh-hinh.service';
const routes: Routes = [
	{
		path: '',
		component: BaoCaoTinhHinhComponent,
		children: [
			{
				path: '',
				component: BaoCaoTinhHinhComponent,
			},
		]
	}
];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		DPSCommonModule,
	],
	providers: [
		BaoCaoTinhHinhService
	],
	entryComponents: [
	],
	declarations: [
		BaoCaoTinhHinhComponent,
	]
})
export class BaoCaoTinhHinhModule { }
