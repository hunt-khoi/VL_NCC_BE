import { QuanHeGiaDinhEditDialogComponent } from './quan-he-gia-dinh-edit/quan-he-gia-dinh-edit-dialog.component';
import { QuanHeGiaDinhListComponent } from './quan-he-gia-dinh-list/quan-he-gia-dinh-list.component';
import { QuanHeGiaDinhComponent } from './quan-he-gia-dinh.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { QuanHeGiaDinhService } from '../quan-he-gia-dinh/Services/quan-he-gia-dinh.service';

@NgModule({
	imports: [
		DPSCommonModule,
	],
	providers: [
		QuanHeGiaDinhService,
	],
	entryComponents: [
		QuanHeGiaDinhComponent,
	],
	declarations: [
		QuanHeGiaDinhListComponent,
		QuanHeGiaDinhEditDialogComponent
	],
	exports: [QuanHeGiaDinhListComponent]
})


export class QuanHeGiaDinhRefModule { }
