import { NienHanDoiTuongListComponent } from './nien-han-doi-tuong-list/nien-han-doi-tuong-list.component';
import { NgModule } from '@angular/core';
import { DPSCommonModule } from '../../dps-common.module';
import { NienHanDoiTuongService } from '../nien-han-doi-tuong/Services/nien-han-doi-tuong.service';
import { DoiTuongCapListComponent } from './doi-tuong-nien-han-cap-list/doi-tuong-nien-han-cap-list.component';
import { NienHanDoiTuongTabComponent } from './nien-han-doi-tuong-tab.component';

@NgModule({
	imports: [
		DPSCommonModule,
	],
	providers: [
		NienHanDoiTuongService,
	],
	entryComponents: [
		NienHanDoiTuongTabComponent,
		NienHanDoiTuongListComponent,
		DoiTuongCapListComponent
	],
	declarations: [
		NienHanDoiTuongTabComponent,
		NienHanDoiTuongListComponent,
		DoiTuongCapListComponent
	],
})

export class NienHanDoiTuongRefModule { }
