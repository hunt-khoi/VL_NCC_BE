import { NgModule } from '@angular/core';
import { ThemeService } from 'ng2-charts';
import { DPSCommonModule } from '../../dps-common.module';

import { QuanLyQuyTabComponent } from './quan-ly-quy-tab/quan-ly-quy-tab.component';
import { QuanLyQuyComponent } from './quan-ly-quy.component';
import { QLQuyInfoComponent } from './quan-ly-quy-info/quan-ly-quy-info.component';
import { QLQuyInfoEditDialogComponent } from './quan-ly-quy-info/quan-ly-quy-info-edit/quan-ly-quy-info-edit-dialog.component';
import { QuanLyQuyInfoCanvasComponent } from './quan-ly-quy-info/quan-ly-quy-info-canvas/quan-ly-quy-info-canvas.component';

import { DongGopQuyEditDialogComponent } from './dong-gop-quy-edit/dong-gop-quy-edit-dialog.component';
import { DongGopQuyListComponent } from './dong-gop-quy-list/dong-gop-quy-list.component';
import { DongGopQuyHistoryDialogComponent } from './dong-gop-quy-history/dong-gop-quy-history-dialog.component';

import { ChiQuyListComponent } from './chi-quy-list/chi-quy-list.component';
import { ChiQuyEditDialogComponent } from './chi-quy-edit/chi-quy-edit-dialog.component';
import { ChiQuyChiDialogComponent } from './quyet-dinh-chi-quy/quyet-dinh-chi-quy.dialog.component';

@NgModule({
	imports: [
		DPSCommonModule
	],
	providers: [
		ThemeService
	],
	entryComponents: [
		QuanLyQuyTabComponent,
		QLQuyInfoEditDialogComponent,
		QuanLyQuyInfoCanvasComponent,
		DongGopQuyEditDialogComponent,
		DongGopQuyHistoryDialogComponent,
		ChiQuyEditDialogComponent,
		ChiQuyChiDialogComponent,
	],
	declarations: [
		QuanLyQuyComponent,
		QuanLyQuyTabComponent,
		QLQuyInfoComponent,
		QLQuyInfoEditDialogComponent,
		QuanLyQuyInfoCanvasComponent,
		DongGopQuyListComponent,
		DongGopQuyEditDialogComponent,
		DongGopQuyHistoryDialogComponent,
		ChiQuyListComponent,
		ChiQuyEditDialogComponent,
		ChiQuyChiDialogComponent,
	],
	exports: [DongGopQuyListComponent, QLQuyInfoComponent, DongGopQuyEditDialogComponent],
	bootstrap: [QLQuyInfoEditDialogComponent]
})

export class QuanLyQuyRefModule { }