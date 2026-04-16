import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { DoiTuongTrangCapService } from './Services/doi-tuong-trang-cap.service';
import { BehaviorSubject } from 'rxjs';
import { QueryParamsModel } from '../../../../../core/_base/crud';

@Component({
	selector: 'kt-doi-tuong-trang-cap',
	templateUrl: './doi-tuong-trang-cap.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class DoiTuongTrangCapComponent implements OnInit {
	constructor(public objectService: DoiTuongTrangCapService,) { }

	ngOnInit() {
		if (this.objectService !== undefined) {
			this.objectService.lastFilter$ = new BehaviorSubject(new QueryParamsModel({}, 'asc', 'SoHoSo', 0, 10));
		}
	}
}
