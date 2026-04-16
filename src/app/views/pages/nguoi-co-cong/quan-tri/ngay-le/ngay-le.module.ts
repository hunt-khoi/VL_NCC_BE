import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { HolidaysListComponent } from './ngay-le-list/ngay-le-list.component';
import { HolidaysEditDialogComponent } from './ngay-le-edit/ngay-le-edit.dialog.component';
import { HolidaysComponent } from './ngay-le.component';
import { HolidaysService } from './Services/ngay-le.service';
import { HolidaysRefModule } from './ngay-le-ref.module';

const routes: Routes = [
	{
		path: '',
		component: HolidaysComponent,
		children: [
			{
				path: '',
				component: HolidaysListComponent,
			},
			{
				path: 'add',
				component: HolidaysEditDialogComponent
			},
			{
				path: 'edit/:id',
				component: HolidaysEditDialogComponent
			},
		]
	}
];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		DPSCommonModule,
		HolidaysRefModule
	],
	providers: [
		HolidaysService
	],
	entryComponents: [
	],
	declarations: [
		HolidaysComponent
	]
})

export class HolidayModule { }
