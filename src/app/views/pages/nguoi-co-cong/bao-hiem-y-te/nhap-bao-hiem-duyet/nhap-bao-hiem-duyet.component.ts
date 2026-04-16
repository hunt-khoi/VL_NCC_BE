import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { NhapBaoHiemService } from '../nhap-bao-hiem/Services/nhap-bao-hiem.service';
import { BehaviorSubject } from 'rxjs';
import { QueryParamsModel } from '../../../../../core/_base/crud';

@Component({
	selector: 'm-nhap-bao-hiem-duyet',
	templateUrl: './nhap-bao-hiem-duyet.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class NhapBaoHiemDuyetComponent implements OnInit {
	constructor(private objectService: NhapBaoHiemService) { }

	ngOnInit() {
		if (this.objectService !== undefined) {
			this.objectService.lastFilter$ = new BehaviorSubject(new QueryParamsModel({}, 'asc', 'Deadline_Duyet', 0, 10));
		} //mặc định theo priority
	}
}
