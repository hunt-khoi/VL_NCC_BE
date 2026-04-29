import { NgModule } from '@angular/core';
import { DPSCommonModule } from '../../dps-common.module';
import { DienChinhHinhService } from '../dien-chinh-hinh/Services/dien-chinh-hinh.service';
import { DienChinhHinhComponent } from './dien-chinh-hinh.component';
import { DienChinhHinhListComponent } from './dien-chinh-hinh-list/dien-chinh-hinh-list.component';
import { DienChinhHinhEditDialogComponent } from './dien-chinh-hinh-edit/dien-chinh-hinh-edit-dialog.component';

@NgModule({
	imports: [
		DPSCommonModule,
	],
	providers: [
		DienChinhHinhService,
	],
	entryComponents: [
		DienChinhHinhComponent,
	],
	declarations: [
		DienChinhHinhListComponent,
		DienChinhHinhEditDialogComponent
	],
	exports: [DienChinhHinhListComponent]
})

export class DienChinhHinhRefModule { }