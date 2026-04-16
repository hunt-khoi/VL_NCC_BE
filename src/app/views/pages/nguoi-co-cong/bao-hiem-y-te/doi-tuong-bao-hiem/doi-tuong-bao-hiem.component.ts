import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { DoiTuongBaoHiemService } from './Services/doi-tuong-bao-hiem.service';
import { BehaviorSubject } from 'rxjs';
import { QueryParamsModel } from '../../../../../core/_base/crud';

@Component({
	selector: 'kt-doi-tuong-bao-hiem',
	templateUrl: './doi-tuong-bao-hiem.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class DoiTuongBaoHiemComponent implements OnInit {
	constructor(public objectService: DoiTuongBaoHiemService,) { }

	ngOnInit() {
		if (this.objectService !== undefined) {
			this.objectService.lastFilter$ = new BehaviorSubject(new QueryParamsModel({}, 'asc', 'SoHoSo', 0, 10));
		}
	}
}
