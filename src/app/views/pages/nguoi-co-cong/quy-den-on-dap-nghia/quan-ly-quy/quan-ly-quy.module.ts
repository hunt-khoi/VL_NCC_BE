import { QuanLyQuyService } from './Services/quan-ly-quy.service';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { QuanLyQuyTabComponent } from './quan-ly-quy-tab/quan-ly-quy-tab.component';
import { QuanLyQuyRefModule } from './quan-ly-quy-ref.module';
import { QuanLyQuyComponent } from './quan-ly-quy.component';

const routes: Routes = [
	{
		path: '',
		component: QuanLyQuyComponent,
		children: [
			{
				path: '',
				component: QuanLyQuyTabComponent,
			},
		]
	}
];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		DPSCommonModule,
		QuanLyQuyRefModule,
	],
	providers: [
		QuanLyQuyService,
	],
	declarations: []
})
export class QuanLyQuyModule { }
