import { QuanHeGiaDinhService } from './Services/quan-he-gia-dinh.service';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { QuanHeGiaDinhEditDialogComponent } from './quan-he-gia-dinh-edit/quan-he-gia-dinh-edit-dialog.component';
import { QuanHeGiaDinhListComponent } from './quan-he-gia-dinh-list/quan-he-gia-dinh-list.component';
import { QuanHeGiaDinhRefModule } from './quan-he-gia-dinh-ref.module';
import { QuanHeGiaDinhComponent } from './quan-he-gia-dinh.component';

const routes: Routes = [
	{
		path: '',
		component: QuanHeGiaDinhComponent,
		children: [
			{
				path: '',
				component: QuanHeGiaDinhListComponent,
			},
			{
				path: 'themmoi',
				component: QuanHeGiaDinhEditDialogComponent,
			},
			{
				path: 'chinhsua/:id',
				component: QuanHeGiaDinhEditDialogComponent,
			},
		]
	}
];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		DPSCommonModule,
		QuanHeGiaDinhRefModule,
	],
	providers: [
		QuanHeGiaDinhService
	],
	entryComponents: [
	],
	declarations: [
		QuanHeGiaDinhComponent
	]
})
export class QuanHeGiaDinhModule { }
