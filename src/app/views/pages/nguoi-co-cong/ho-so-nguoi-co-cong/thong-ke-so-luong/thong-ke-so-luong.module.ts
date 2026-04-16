import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { ThongKeSoLuongComponent } from './thong-ke-so-luong.component';
import { ThongKeSoLuongService } from './Services/thong-ke-so-luong.service';
import { ThongKeSoLuongViewComponent } from './thong-ke-so-luong-view/thong-ke-so-luong-view.component';
import { ChiTietThongKeComponent } from './chi-tiet-thong-ke/chi-tiet-thong-ke.component';

const routes: Routes = [
	{
		path: '',
		component: ThongKeSoLuongComponent,
		children: [
			{
				path: '',
				component: ThongKeSoLuongViewComponent,
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
		ThongKeSoLuongService,
	],
	entryComponents: [
		ChiTietThongKeComponent,
	],
	declarations: [
		ThongKeSoLuongComponent,
		ThongKeSoLuongViewComponent,
		ChiTietThongKeComponent
	]
})

export class ThongKeSoLuongModule { }
