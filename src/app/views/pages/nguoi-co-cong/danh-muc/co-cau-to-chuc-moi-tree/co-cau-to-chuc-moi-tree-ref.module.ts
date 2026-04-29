import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { cocautochucMoiTreeService } from './Services/co-cau-to-chuc-moi-tree.service';
import { CoCauMapDialogComponent } from './co-cau-map/co-cau-map-dialog.component';
import { cocautochucmoitreeComponent } from './co-cau-to-chuc-moi-tree-list/co-cau-to-chuc-moi-tree-list.component';
import { CoCauToChucEditComponent } from './co-cau-to-chuc-moi-tree-edit/co-cau-to-chuc-moi-tree-edit.component';

@NgModule({
	imports: [
		RouterModule,
		DPSCommonModule
	],
	providers: [
		cocautochucMoiTreeService,
	],
	entryComponents: [
		cocautochucmoitreeComponent,
		CoCauToChucEditComponent,
		CoCauMapDialogComponent
	],
	declarations: [
		cocautochucmoitreeComponent,
		CoCauToChucEditComponent,
		CoCauMapDialogComponent
	],
	exports: [
		cocautochucmoitreeComponent,
		CoCauToChucEditComponent,
		CoCauMapDialogComponent
	]
})

export class cocautochucmoiTreeRefModule { }