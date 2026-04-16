import { KHVanDongEditDialogComponent } from './ke-hoach-van-dong-edit/ke-hoach-van-dong-edit-dialog.component';
import { KeHoachVanDongListComponent } from './ke-hoach-van-dong-list/ke-hoach-van-dong-list.component';
import { KeHoachVanDongComponent } from './ke-hoach-van-dong.component';
import { NgModule } from '@angular/core';
import { DPSCommonModule } from '../../dps-common.module';
import { KeHoachVanDongService } from '../ke-hoach-van-dong/Services/ke-hoach-van-dong.service';
import { KHVanDongDetailEditDialogComponent } from './ke-hoach-van-dong-detail-edit/ke-hoach-van-dong-detail-edit-dialog.component';
import { KeHoachVanDongListGiaoComponent } from './ke-hoach-van-dong-list-giao/ke-hoach-van-dong-list-giao.component';
import { KeHoachVanDongTabComponent } from './ke-hoach-van-dong-tab/ke-hoach-van-dong-tab.component';
import { QuanLyQuyRefModule } from '../quan-ly-quy/quan-ly-quy-ref.module';
import { QuanLyQuyService } from '../quan-ly-quy/Services/quan-ly-quy.service';

@NgModule({
	imports: [
		DPSCommonModule,
		QuanLyQuyRefModule
	],
	providers: [
		KeHoachVanDongService,
		QuanLyQuyService
	],
	entryComponents: [
		KeHoachVanDongComponent,
		KeHoachVanDongTabComponent,
		KHVanDongEditDialogComponent,
		KHVanDongDetailEditDialogComponent
	],
	declarations: [
		KeHoachVanDongTabComponent,
		KeHoachVanDongListComponent,
		KeHoachVanDongListGiaoComponent,
		KHVanDongEditDialogComponent,
		KHVanDongDetailEditDialogComponent
	],
	exports: [KeHoachVanDongListComponent]
})

export class KeHoachVanDongRefModule { }