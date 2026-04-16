import { DoiTuongNguoiCoCongService } from './Services/doi-tuong-nguoi-co-cong.service';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { DoiTuongNguoiCoCongEditDialogComponent } from './doi-tuong-nguoi-co-cong-edit/doi-tuong-nguoi-co-cong-edit-dialog.component';
import { DoiTuongNguoiCoCongListComponent } from './doi-tuong-nguoi-co-cong-list/doi-tuong-nguoi-co-cong-list.component';
import { DoiTuongNguoiCoCongRefModule } from './doi-tuong-nguoi-co-cong-ref.module';
import { DoiTuongNguoiCoCongComponent } from './doi-tuong-nguoi-co-cong.component';
import { MAT_DIALOG_DATA } from '@angular/material';

const routes: Routes = [
	{
		path: '',
		component: DoiTuongNguoiCoCongComponent,
		children: [
			{
				path: '',
				component: DoiTuongNguoiCoCongListComponent,
			},
			{
				path: 'themmoi',
				component: DoiTuongNguoiCoCongEditDialogComponent,
			},
			{
				path: 'chinhsua/:id',
				component: DoiTuongNguoiCoCongEditDialogComponent,
			},
		]
	}
];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		DPSCommonModule,
		DoiTuongNguoiCoCongRefModule,

	],
	providers: [
		DoiTuongNguoiCoCongService,
		{ provide: MAT_DIALOG_DATA, useValue: [] }
	],
	entryComponents: [
	],
	declarations: [
		DoiTuongNguoiCoCongComponent
	]
})
export class DoiTuongNguoiCoCongModule { }
