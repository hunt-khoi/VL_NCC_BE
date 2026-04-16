import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { QueryParamsModel } from 'app/core/_base/crud';
import { BehaviorSubject } from 'rxjs';
import { DoiTuongNguoiCoCongService } from './Services/doi-tuong-nguoi-co-cong.service';
import { TokenStorage } from 'app/core/auth/_services/token-storage.service';

@Component({
	selector: 'kt-doi-tuong-nguoi-co-cong',
	templateUrl: './doi-tuong-nguoi-co-cong.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class DoiTuongNguoiCoCongComponent implements OnInit {
	constructor(public doiTuongNguoiCoCongService: DoiTuongNguoiCoCongService, private tokenStorage: TokenStorage) {

	}

	filterprovinces: number
	ngOnInit() {
		this.tokenStorage.getUserInfo().subscribe(res => {
			this.filterprovinces = res.IdTinh;
		})
		if (this.doiTuongNguoiCoCongService !== undefined) {
			this.doiTuongNguoiCoCongService.lastFilter$ = new BehaviorSubject(new QueryParamsModel({}, 'asc', 'Priority', 0, 10));
		}
	}
}
