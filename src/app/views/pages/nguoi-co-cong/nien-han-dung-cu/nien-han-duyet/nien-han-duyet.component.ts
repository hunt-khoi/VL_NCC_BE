import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { NienHanService } from '../nien-han/Services/nien-han.service';
import { BehaviorSubject } from 'rxjs';
import { QueryParamsModel } from '../../../../../core/_base/crud';

@Component({
	selector: 'm-nien-han-duyet',
	templateUrl: './nien-han-duyet.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class NienHanDuyetComponent implements OnInit {
	constructor(private NienHanService1: NienHanService) { }

	ngOnInit() {
		if (this.NienHanService1 !== undefined) {
			this.NienHanService1.lastFilter$ = new BehaviorSubject(new QueryParamsModel({}, 'asc', 'Deadline_Duyet', 0, 10));
		} //mặc định theo priority
	}
}
