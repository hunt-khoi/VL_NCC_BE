import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { chucvuService } from './Services/chucvu.service';
import { chucvuComponent } from './chucvu.component';
import { chucvuListComponent } from './chucvu-list/chucvu-list.component';
import { chucvuEditDialogComponent } from './chucvu-edit/chucvu-edit.dialog.component';

const routes: Routes = [
	{
		path: '',
		component: chucvuComponent,
		children: [
			{
				path: '',
				component: chucvuListComponent,
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
		chucvuService
	],
	entryComponents: [
		chucvuListComponent,
		chucvuEditDialogComponent,
	],
	declarations: [
		chucvuComponent,
		chucvuListComponent,
		chucvuEditDialogComponent,
	]
})

export class chucvuModule { }