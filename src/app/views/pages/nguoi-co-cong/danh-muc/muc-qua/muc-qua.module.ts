import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { MucQuaService } from './Services/muc-qua.service';
import { MucQuaRefModule } from './muc-qua-ref.module';
import { MucQuaComponent } from './muc-qua.component';
import { MucQuaListComponent } from './muc-qua-list/muc-qua-list.component';
import { MucQuaEditDialogComponent } from './muc-qua-edit/muc-qua-edit-dialog.component';

const routes: Routes = [
	{
		path: '',
		component: MucQuaComponent,
		children: [
			{
				path: '',
				component: MucQuaListComponent,
			},
			{
				path: 'themmoi',
				component: MucQuaEditDialogComponent,
			},
			{
				path: 'chinhsua/:id',
				component: MucQuaEditDialogComponent,
			},
		]
	}
];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		DPSCommonModule,
		MucQuaRefModule,
	],
	providers: [
		MucQuaService
	],
	declarations: [
		MucQuaComponent
	]
})

export class MucQuaModule { }