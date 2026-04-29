import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { ChucDanhService } from './Services/chucdanh.service';
import { ChucDanhComponent } from './chucdanh.component';
import { ChucDanhListComponent } from './chucdanh-list/chucdanh-list.component';
import { ChucDanhEditDialogComponent } from './chucdanh-edit/chucdanh-edit.dialog.component';

const routes: Routes = [
	{
		path: '',
		component: ChucDanhComponent,
		children: [
			{
				path: '',
				component: ChucDanhListComponent,
			},
			{
				path: 'themmoi',
				component: ChucDanhEditDialogComponent
			},
			{
				path: 'chinhsua/:id',
				component: ChucDanhEditDialogComponent
			},
		]
	}
];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		DPSCommonModule,
	],
	providers: [
		ChucDanhService,
	],
	entryComponents: [
		ChucDanhListComponent,
	],
	declarations: [
		ChucDanhComponent,
		ChucDanhListComponent,
		ChucDanhEditDialogComponent,
	]
})

export class ChucDanhModule { }