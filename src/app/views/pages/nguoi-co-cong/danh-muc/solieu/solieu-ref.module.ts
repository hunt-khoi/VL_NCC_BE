import { NgModule } from '@angular/core';
import { DPSCommonModule } from '../../dps-common.module';
import { solieuService } from './Services/solieu.service';
import { solieuListComponent } from './solieu-list/solieu-list.component';
import { solieuEditDialogComponent } from './solieu-edit/solieu-edit.dialog.component';
import { filterService } from './Services/filter.service';
import { FilterComponent } from './filter/filter.component';
import { filterEditComponent } from './filter-edit/filter-edit.component';
import { cachNhapService } from './Services/cachnhap.service';
import { cachNhapListComponent } from './cachnhap-list/cachnhap-list.component';
import { cachnhapEditDialogComponent } from './cachnhap-edit/cachnhap-edit.dialog.component';

@NgModule({
	imports: [
		DPSCommonModule
	],
	providers: [
		solieuService,
		filterService,
		cachNhapService
	],
	entryComponents: [
		solieuEditDialogComponent,
		filterEditComponent,
		cachnhapEditDialogComponent
	],
	declarations: [
		solieuListComponent,
		solieuEditDialogComponent,
		FilterComponent,
		filterEditComponent,
		cachNhapListComponent,
		cachnhapEditDialogComponent
	],
	exports:[
		solieuListComponent,
		FilterComponent,
		cachNhapListComponent
	]
})

export class solieuRefModule { }