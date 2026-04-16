import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { DoiTuongNhanQuaService } from './Services/doi-tuong-nhan-qua.service';
import { BehaviorSubject } from 'rxjs';
import { QueryParamsModel } from '../../../../../core/_base/crud';

@Component({
	selector: 'kt-doi-tuong-nhan-qua',
	templateUrl: './doi-tuong-nhan-qua.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class DoiTuongNhanQuaComponent implements OnInit {
	constructor(public objectService: DoiTuongNhanQuaService,) { }

	ngOnInit() {
		if (this.objectService !== undefined) {
			this.objectService.lastFilter$ = new BehaviorSubject(new QueryParamsModel({}, 'asc', 'SoHoSo', 0, 10));
		}
	}
}
