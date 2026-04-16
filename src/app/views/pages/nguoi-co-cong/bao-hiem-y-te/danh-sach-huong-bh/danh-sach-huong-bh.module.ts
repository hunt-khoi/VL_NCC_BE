import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { DSHuongBaoHiemListComponent } from './danh-sach-huong-bh-list/danh-sach-huong-bh-list.component';
import { DSHuongBaoHiemComponent } from './danh-sach-huong-bh.component';
import { DSHuongBaoHiemService } from './Services/danh-sach-huong-bh.service';
import { DSHuongBaoHiemRefModule } from './danh-sach-huong-bh-ref.module';

const routes: Routes = [
	{
		path: '',
		component: DSHuongBaoHiemComponent,
		children: [
			{
				path: '',
				component: DSHuongBaoHiemListComponent,
			},
		]
	}
];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		DPSCommonModule,
        DSHuongBaoHiemRefModule,
	],
	providers: [
		DSHuongBaoHiemService
	],
	entryComponents: [
	],
	declarations: [
		DSHuongBaoHiemComponent,
	]
})
export class DSHuongBaoHiemModule { }
