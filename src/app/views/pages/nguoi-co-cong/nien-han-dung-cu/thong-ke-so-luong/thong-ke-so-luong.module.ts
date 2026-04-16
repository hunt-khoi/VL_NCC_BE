import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { ThongKeSoLuongRefModule } from './thong-ke-so-luong-ref.module';
import { ThongKeSoLuongComponent } from './thong-ke-so-luong.component';
import { ThongKeTabComponent } from './thong-ke-tab.component';

const routes: Routes = [
	{
		path: '',
		component: ThongKeSoLuongComponent,
		children: [
			{
				path: '',
				component: ThongKeTabComponent,
			},
		]
	}
];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		DPSCommonModule,
        ThongKeSoLuongRefModule,
	],
	providers: [
		
	],
	entryComponents: [
	],
	declarations: [
		ThongKeSoLuongComponent,
	]
})
export class ThongKeSoLuongModule { }
