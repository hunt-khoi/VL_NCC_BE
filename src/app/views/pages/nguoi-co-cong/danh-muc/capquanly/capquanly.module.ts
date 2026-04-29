import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { capquanlyService } from './Services/capquanly.service';
import { capquanlyComponent } from './capquanly.component';
import { capquanlyListComponent } from './capquanly-list/capquanly-list.component';
import { capquanlyEditDialogComponent } from './capquanly-edit/capquanly-edit.dialog.component';

const routes: Routes = [
	{
		path: '',
		component: capquanlyComponent,
		children: [
			{
				path: '',
				component: capquanlyListComponent,
			},
			{
				path: 'themmoi',
				component: capquanlyEditDialogComponent
			},
			{
				path: 'chinhsua/:id',
				component: capquanlyEditDialogComponent
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
		capquanlyService
	],
	entryComponents: [
		capquanlyListComponent,
	],
	declarations: [
		capquanlyComponent,
		capquanlyListComponent,
		capquanlyEditDialogComponent,
	]
})

export class capquanlyModule { }