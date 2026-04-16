import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { ThoiHanComponent } from './thoi-han.component';
import { ThoiHanListComponent } from './thoi-han-list/thoi-han-list.component';
import { ThoiHanRefModule } from './thoi-han-ref.module';
import { ThoiHanService } from './Services/thoi-han.service';

const routes: Routes = [
	{
		path: '',
		component: ThoiHanComponent,
		children: [
			{
				path: '',
				component: ThoiHanListComponent,
			}
		]
	}
];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		DPSCommonModule,
		ThoiHanRefModule,
	],
	providers: [
		ThoiHanService,
	],
	entryComponents: [
	],
	declarations: [
		ThoiHanComponent,
	],
})
export class ThoiHanModule { }
