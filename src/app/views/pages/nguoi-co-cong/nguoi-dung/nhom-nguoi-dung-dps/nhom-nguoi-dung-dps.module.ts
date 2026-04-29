import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CdkTreeModule } from '@angular/cdk/tree';
import { DPSCommonModule } from '../../dps-common.module';
import { NhomNguoiDungDPSService } from './Services/nhom-nguoi-dung-dps.service';
import { PhanQuyenComponent } from './phan-quyen/phan-quyen.component';
import { NhomNguoiDungDPSComponent } from './nhom-nguoi-dung-dps.component';
import { NhomNguoiDungDPSListComponent } from './nhom-nguoi-dung-dps-list/nhom-nguoi-dung-dps-list.component';
import { NhomNguoiDungDPSEditComponent } from './nhom-nguoi-dung-dps-edit/nhom-nguoi-dung-dps-edit.component';

const routes: Routes = [
	{
		path: '',
		component: NhomNguoiDungDPSComponent,
		children: [
			{
				path: '',
				component: NhomNguoiDungDPSListComponent,
			}
		]
	}
];

@NgModule({
    imports: [
		RouterModule.forChild(routes),
		DPSCommonModule,
		CdkTreeModule
	],
	providers: [
		NhomNguoiDungDPSService
	],
	entryComponents: [
		NhomNguoiDungDPSEditComponent,
		PhanQuyenComponent
	],
	declarations: [
		NhomNguoiDungDPSComponent,
		NhomNguoiDungDPSListComponent,
		NhomNguoiDungDPSEditComponent,
		PhanQuyenComponent
	]
})

export class NhomNguoiDungDPSModule {}