import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { HoSoNhaOService } from './Services/ho-so-nha-o.service';
import { BehaviorSubject } from 'rxjs';
import { QueryParamsModel } from '../../../../../core/_base/crud';

@Component({
	selector: 'kt-ho-so-nha-o',
	templateUrl: './ho-so-nha-o.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class HoSoNhaOComponent implements OnInit {
	constructor(public objectService: HoSoNhaOService,) { }

	ngOnInit() {
		if (this.objectService !== undefined) {
			this.objectService.lastFilter$ = new BehaviorSubject(new QueryParamsModel({}, 'asc', 'SoHoSo', 0, 10));
		}
	}
}
