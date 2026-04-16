import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { BaoCaoThongKeComponent } from './bao-cao-thong-ke.component';
import { BaoCaoThongKeViewComponent } from './bao-cao-thong-ke-view/bao-cao-thong-ke-view.component';
import { BaoCaoThongKeService } from './Services/bao-cao-thong-ke.service';

const routes: Routes = [
	{
		path: '',
		component: BaoCaoThongKeComponent,
		children: [
			{
				path: '',
				component: BaoCaoThongKeViewComponent,
			}
		]
	}
];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		DPSCommonModule
	],
	providers: [
		BaoCaoThongKeService
	],
	entryComponents: [
	],
	declarations: [
		BaoCaoThongKeComponent,
		BaoCaoThongKeViewComponent
	],
})

export class BaoCaoThongKeModule { }
