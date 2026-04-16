import { DienChinhHinhService } from './Services/dien-chinh-hinh.service';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { DienChinhHinhEditDialogComponent } from './dien-chinh-hinh-edit/dien-chinh-hinh-edit-dialog.component';
import { DienChinhHinhListComponent } from './dien-chinh-hinh-list/dien-chinh-hinh-list.component';
import { DienChinhHinhRefModule } from './dien-chinh-hinh-ref.module';
import { DienChinhHinhComponent } from './dien-chinh-hinh.component';


const routes: Routes = [
	{
		path: '',
		component: DienChinhHinhComponent,
		children: [
			{
				path: '',
				component: DienChinhHinhListComponent,
			},
			{
				path: 'themmoi',
				component: DienChinhHinhEditDialogComponent,
			},
			{
				path: 'chinhsua/:id',
				component: DienChinhHinhEditDialogComponent,
			},
		]
	}
];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		DPSCommonModule,
		DienChinhHinhRefModule,
	],
	providers: [
		DienChinhHinhService
	],
	entryComponents: [
	],
	declarations: [
		DienChinhHinhComponent
	]
})
export class DienChinhHinhModule { }
