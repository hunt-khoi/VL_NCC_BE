import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NhapQuyTrinhDuyetListComponent } from './nhap-quy-trinh-duyet-list/nhap-quy-trinh-duyet-list.component';
import { NhapQuyTrinhDuyetComponent } from './nhap-quy-trinh-duyet.component';
import { NhapQuyTrinhDuyetService } from './Services/nhap-quy-trinh-duyet.service';
import { NhapQuyTrinhDuyetEditComponent } from './nhap-quy-trinh-duyet-edit/nhap-quy-trinh-duyet-edit.component';
import { DPSCommonModule } from '../../dps-common.module';
import { NhapCapQuanLyDuyetEditComponent } from './nhap-cap-quan-ly-duyet-edit/nhap-cap-quan-ly-duyet-edit.component';
import { DieuKienEditDialogComponent } from './dieu-kien-edit/dieu-kien-edit.dialog.component';
import { DieuKienListComponent } from './dieu-kien-list/dieu-kien-list.component';

const routes: Routes = [
	{
		path: '',
		component: NhapQuyTrinhDuyetComponent,
		children: [
			{
				path: '',
				component: NhapQuyTrinhDuyetListComponent,
			},
			{
				path: 'them-moi',
				component: NhapQuyTrinhDuyetEditComponent,
			},
			{
				path: 'chinh-sua/:id',
				component: NhapQuyTrinhDuyetEditComponent,
			},
			{
				path: 'chi-tiet/:id',
				component: NhapQuyTrinhDuyetEditComponent,
				data: {allowEdit:false}
			},
		]
	}
];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		DPSCommonModule
	],
	providers: [
		NhapQuyTrinhDuyetService
	],
	entryComponents: [
		NhapCapQuanLyDuyetEditComponent,
		DieuKienEditDialogComponent
	],
	declarations: [
		NhapQuyTrinhDuyetComponent,
		NhapQuyTrinhDuyetEditComponent,
		NhapQuyTrinhDuyetListComponent,
		NhapCapQuanLyDuyetEditComponent,
		DieuKienEditDialogComponent,
		DieuKienListComponent
	]
})
export class NhapQuyTrinhDuyetModule { }
