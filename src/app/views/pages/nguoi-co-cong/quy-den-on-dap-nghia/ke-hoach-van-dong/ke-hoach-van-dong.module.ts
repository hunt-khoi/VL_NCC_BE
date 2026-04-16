import { KeHoachVanDongService } from './Services/ke-hoach-van-dong.service';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { KeHoachVanDongTabComponent } from './ke-hoach-van-dong-tab/ke-hoach-van-dong-tab.component';
import { KeHoachVanDongRefModule } from './ke-hoach-van-dong-ref.module';
import { KeHoachVanDongComponent } from './ke-hoach-van-dong.component';

const routes: Routes = [
	{
		path: '',
		component: KeHoachVanDongComponent,
		children: [
			{
				path: '',
				component: KeHoachVanDongTabComponent,
			},
		]
	}
];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		DPSCommonModule,
		KeHoachVanDongRefModule,
	],
	providers: [
		KeHoachVanDongService,
	],
	entryComponents: [
	],
	declarations: [
		KeHoachVanDongComponent
	]
})
export class KeHoachVanDongModule { }
