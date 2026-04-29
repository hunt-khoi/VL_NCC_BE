import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DndModule } from 'ngx-drag-drop';
import { DPSCommonModule } from '../../dps-common.module';
import { OrgChartService } from './Services/so-do-to-chuc.service';
import { SodotochucComponent } from './so-do-to-chuc-new.component';
import { SodotochucListComponent } from './so-do-to-chuc-new-list/so-do-to-chuc-new-list.component';
import { DrawListComponent } from './draw-chart/draw-chart-list.component';
import { sodotochuceditComponent } from './so-do-to-chuc-edit/so-do-to-chuc-edit.component';
import { OrgChartRefNewModule } from './OrgChart-ref.module';

const routes: Routes = [
	{
		path: '',
		component: SodotochucComponent,
		children: [
			{
				path: '',
				component: SodotochucListComponent,
			},
			{
				path: 'updatethongtinchucvu/:id_cd',
				component: sodotochuceditComponent,
			},
			{
				path: 'drawchart/:ID',
				component: DrawListComponent,
			},
		]
	}
];

@NgModule({
	imports: [
		RouterModule.forChild(routes),		
		DndModule,
		OrgChartRefNewModule,
		DPSCommonModule
	],
	providers: [
		OrgChartService,
	],
	entryComponents: [
		SodotochucComponent,
		sodotochuceditComponent,
		DrawListComponent
	],
	declarations: [
		SodotochucComponent,
	],
})

export class SoDoToChucModule { }