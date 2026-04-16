import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { HoSoNCCService } from './Services/ho-so-ncc.service';
import { BehaviorSubject } from 'rxjs';
import { QueryParamsModel } from '../../../../../core/_base/crud';

@Component({
	selector: 'kt-ho-so-ncc',
	templateUrl: './ho-so-ncc.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class HoSoNCCComponent implements OnInit {
	constructor(public objectService: HoSoNCCService,) { }

	ngOnInit() {
		if (this.objectService !== undefined) {
			this.objectService.lastFilter$ = new BehaviorSubject(new QueryParamsModel({}, 'desc', 'NgayGui', 0, 10));
		}
	}
}
