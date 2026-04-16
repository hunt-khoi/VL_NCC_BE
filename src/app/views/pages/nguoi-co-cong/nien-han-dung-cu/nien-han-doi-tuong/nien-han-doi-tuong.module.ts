import { NienHanDoiTuongService } from './Services/nien-han-doi-tuong.service';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { NienHanDoiTuongRefModule } from './nien-han-doi-tuong-ref.module';
import { NienHanDoiTuongComponent } from './nien-han-doi-tuong.component';
import { NienHanDoiTuongTabComponent } from './nien-han-doi-tuong-tab.component';

const routes: Routes = [
	{
		path: '',
		component: NienHanDoiTuongComponent,
		children: [
			{
				path: '',
				component: NienHanDoiTuongTabComponent,
			},
		]
	}
];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		DPSCommonModule,
		NienHanDoiTuongRefModule,
	],
	providers: [
		NienHanDoiTuongService
	],
	entryComponents: [
	],
	declarations: [
		NienHanDoiTuongComponent
	]
})
export class NienHanDoiTuongModule { }
