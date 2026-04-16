import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { QuyetDinhComponent } from './quyet-dinh.component';
import { QuyetDinhService } from './Services/quyet-dinh.service';
import { QuyetDinhListComponent } from './quyet-dinh-list/quyet-dinh-list.component';
import { QuyetDinhRefModule } from './quyet-dinh-ref.module';
import { XuatQuyetDinhComponent } from './xuat-quyet-dinh/xuat-quyet-dinh.component';
import { XuatDanhSachComponent } from './xuat-danh-sach/xuat-danh-sach.component';

const routes: Routes = [
	{
		path: '',
		component: QuyetDinhComponent,
		children: [
			{
				path: '',
				component: QuyetDinhListComponent,
			},
		]
	}
];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		DPSCommonModule,
		QuyetDinhRefModule
	],
	providers: [
		QuyetDinhService
	],
	entryComponents: [
	],
	declarations: [
		QuyetDinhComponent,
		QuyetDinhListComponent,
		XuatQuyetDinhComponent,
		XuatDanhSachComponent,
	]
})
export class QuyetDinhModule { }
