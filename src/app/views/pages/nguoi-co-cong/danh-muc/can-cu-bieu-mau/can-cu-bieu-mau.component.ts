import { Component, OnInit } from '@angular/core';
import { BieuMauService } from './services/bieu-mau.service';
import { CanCuService } from './services/can-cu.service';
import { BehaviorSubject } from 'rxjs';
import { QueryParamsModel } from '../../../../../core/_base/crud';

@Component({
	selector: 'kt-can-cu-bieu-mau',
	templateUrl: './can-cu-bieu-mau.component.html'
})
export class CanCuBieuMauComponent implements OnInit {

	constructor(
		private bmService: BieuMauService,
		private ccService: CanCuService) { }

	ngOnInit() {
		if (this.bmService !== undefined) {
			this.bmService.lastFilter$ = new BehaviorSubject(new QueryParamsModel({}, 'asc', 'Priority', 0, 10));
		}
		if (this.ccService !== undefined) {
			this.ccService.lastFilter$ = new BehaviorSubject(new QueryParamsModel({}, 'asc', 'Priority', 0, 10));
		}
	}

}
