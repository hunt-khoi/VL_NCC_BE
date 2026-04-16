import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { DeXuatService } from '../de-xuat/Services/de-xuat.service';
import { BehaviorSubject } from 'rxjs';
import { QueryParamsModel } from '../../../../../core/_base/crud';

@Component({
	selector: 'm-de-xuat-duyet',
	templateUrl: './de-xuat-duyet.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeXuatDuyetComponent implements OnInit {
	constructor(private DeXuatService1: DeXuatService) { }

	ngOnInit() {
		if (this.DeXuatService1 !== undefined) {
			this.DeXuatService1.lastFilter$ = new BehaviorSubject(new QueryParamsModel({}, 'asc', 'Deadline_Duyet', 0, 10));
		} //mặc định theo priority
	}
}
