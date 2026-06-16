import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { QueryParamsModel } from '../../../../../core/_base/crud';
import { QuaTrinhKhongCoNguoiDuyetService } from './Services/qua-trinh-khong-co-nguoi-duyet.service';

@Component({
	selector: 'kt-qua-trinh-khong-co-nguoi-duyet',
	templateUrl: './qua-trinh-khong-co-nguoi-duyet.component.html',
})
export class QuaTrinhKhongCoNguoiDuyetComponent implements OnInit {

	constructor(private apiService: QuaTrinhKhongCoNguoiDuyetService) { }

	ngOnInit() {
		if (this.apiService)
			this.apiService.lastFilter$ = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));
	}
}