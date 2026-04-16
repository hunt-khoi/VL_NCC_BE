import { NgModule } from '@angular/core';

import { DPSCommonModule } from '../../dps-common.module';
import { ThongKeTangGiamService } from './Services/thong-ke-dc-tang-giam.service';
import { thongkeDCTangGiamComponent } from './thong-ke-dc-tang-giam.component';

@NgModule({
	imports: [
		DPSCommonModule
	],
	providers: [
		ThongKeTangGiamService
	],
	entryComponents: [
		thongkeDCTangGiamComponent,
	],
	declarations: [
		thongkeDCTangGiamComponent,
	],
	exports:[
		thongkeDCTangGiamComponent,
	]
})
export class thongkeDCTangGiamRefModule { }
