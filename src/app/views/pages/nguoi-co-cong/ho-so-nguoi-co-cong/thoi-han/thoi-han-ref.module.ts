import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { ThoiHanService } from './Services/thoi-han.service';
import { ThoiHanComponent } from './thoi-han.component';
import { ThoiHanListComponent } from './thoi-han-list/thoi-han-list.component';

@NgModule({
	imports: [
		RouterModule,
		DPSCommonModule,
	],
	providers: [
		ThoiHanService
	],
	entryComponents: [
		ThoiHanComponent,
	],
	declarations: [
		ThoiHanListComponent,
	],
	exports: [ThoiHanListComponent]
})

export class ThoiHanRefModule { }