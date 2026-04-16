import { DoiTuongTrangCapService } from './Services/doi-tuong-trang-cap.service';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { DoiTuongTrangCapComponent } from './doi-tuong-trang-cap.component';
import { DoiTuongTrangCapRefModule } from './doi-tuong-trang-cap-ref.module';
import { DoiTuongTrangCapListComponent } from './doi-tuong-trang-cap-list/doi-tuong-trang-cap-list.component';

const routes: Routes = [
	{
		path: '',
		component: DoiTuongTrangCapComponent,
		children: [
			{
				path: '',
				component: DoiTuongTrangCapListComponent
			}
		]
	}
];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		DPSCommonModule,
		DoiTuongTrangCapRefModule,	],
	providers: [
		DoiTuongTrangCapService
	],
	entryComponents: [
	],
	declarations: [
		DoiTuongTrangCapComponent,
	],
})
export class DoiTuongTrangCapModule { }
