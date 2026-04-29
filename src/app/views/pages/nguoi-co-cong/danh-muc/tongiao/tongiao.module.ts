import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { tongiaoService } from './Services/tongiao.service';
import { tongiaoComponent } from './tongiao.component';
import { tongiaoListComponent } from './tongiao-list/tongiao-list.component';
import { tongiaoEditDialogComponent } from './tongiao-edit/tongiao-edit.dialog.component';

const routes: Routes = [
	{
		path: '',
		component: tongiaoComponent,
		children: [
			{
				path: '',
				component: tongiaoListComponent,
			}
		]
	}
];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		DPSCommonModule,
	],
	providers: [
		tongiaoService
	],
	entryComponents: [
		tongiaoEditDialogComponent
	],
	declarations: [
		tongiaoComponent,
		tongiaoListComponent,
		tongiaoEditDialogComponent
	]
})

export class tongiaoModule { }