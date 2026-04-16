import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { ThoiHanSoLieuComponent } from './thoi-han-so-lieu.component';
import { ThoiHanSoLieuListComponent } from './thoi-han-so-lieu-list/thoi-han-so-lieu-list.component';
import { ThoiHanSoLieuRefModule } from './thoi-han-so-lieu-ref.module';
import { ThoiHanSoLieuService } from './Services/thoi-han-so-lieu.service';

const routes: Routes = [
	{
		path: '',
		component: ThoiHanSoLieuComponent,
		children: [
			{
				path: '',
				component: ThoiHanSoLieuListComponent,
			}
		]
	}
];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		DPSCommonModule,
		ThoiHanSoLieuRefModule,
	],
	providers: [
		ThoiHanSoLieuService,
	],
	entryComponents: [
	],
	declarations: [
		ThoiHanSoLieuComponent,
	],
})

export class ThoiHanSoLieuModule { }
