import { Component, OnInit, Injectable } from '@angular/core';
import { QuaTrinhKhongCoNguoiDuyetService } from './Services/qua-trinh-khong-co-nguoi-duyet.service';
import { BehaviorSubject } from 'rxjs';
import { QueryParamsModel } from '../../../../../core/_base/crud';

@Component({
	selector: 'kt-qua-trinh-khong-co-nguoi-duyet',
	templateUrl: './qua-trinh-khong-co-nguoi-duyet.component.html',
})

@Injectable()
export class QuaTrinhKhongCoNguoiDuyetComponent implements OnInit {
	constructor(private service: QuaTrinhKhongCoNguoiDuyetService) { }

	ngOnInit() {
		if (this.service)
			this.service.lastFilter$ = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));
	}
}