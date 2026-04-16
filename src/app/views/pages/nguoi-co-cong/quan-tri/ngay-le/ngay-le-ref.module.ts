import { NgModule } from '@angular/core';
import { HolidaysListComponent } from './ngay-le-list/ngay-le-list.component';
import { HolidaysEditDialogComponent } from './ngay-le-edit/ngay-le-edit.dialog.component';
import { HolidaysService } from './Services/ngay-le.service';
import { DPSCommonModule } from '../../dps-common.module';

@NgModule({
	imports: [
		DPSCommonModule,
	],
	providers: [
		HolidaysService
	],
	entryComponents: [
		HolidaysListComponent
	],
	declarations: [
		HolidaysListComponent,
		HolidaysEditDialogComponent 
	],
	exports:[
		HolidaysListComponent
	]
})

export class HolidaysRefModule { }
