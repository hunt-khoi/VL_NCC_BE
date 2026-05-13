import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { QueryParamsModel } from '../../../../../core/_base/crud';
import { DeXuatService } from '../de-xuat/Services/de-xuat.service';

@Component({
	selector: 'm-de-xuat-duyet',
	templateUrl: './de-xuat-duyet.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeXuatDuyetComponent implements OnInit {
	constructor(private apiService: DeXuatService) { }

	ngOnInit() {
		if (this.apiService !== undefined) {
			this.apiService.lastFilter$ = new BehaviorSubject(new QueryParamsModel({}, 'asc', 'Deadline_Duyet', 0, 10));
		} 
	}
}