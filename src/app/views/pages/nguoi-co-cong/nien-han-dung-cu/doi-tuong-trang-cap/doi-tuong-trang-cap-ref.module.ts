import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { DoiTuongTrangCapEditDialogComponent } from './doi-tuong-trang-cap-edit/doi-tuong-trang-cap-edit-dialog.component';
import { DoiTuongTrangCapImportComponent } from './doi-tuong-trang-cap-import/doi-tuong-trang-cap-import.component';
import { DoiTuongTrangCapListComponent } from './doi-tuong-trang-cap-list/doi-tuong-trang-cap-list.component';
import { DoiTuongTrangCapService } from './Services/doi-tuong-trang-cap.service';

@NgModule({
	imports: [
		RouterModule,
		DPSCommonModule,
	],
	providers: [
		DoiTuongTrangCapService,
	],
	entryComponents: [
		DoiTuongTrangCapImportComponent,
		DoiTuongTrangCapEditDialogComponent
	],
	declarations: [
		DoiTuongTrangCapListComponent,
		DoiTuongTrangCapEditDialogComponent,
		DoiTuongTrangCapImportComponent
	],
	exports: [DoiTuongTrangCapListComponent, DoiTuongTrangCapEditDialogComponent]
})


export class DoiTuongTrangCapRefModule { }
