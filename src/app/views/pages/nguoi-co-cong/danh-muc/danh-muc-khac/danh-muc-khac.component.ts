import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { QueryParamsModel } from '../../../../../core/_base/crud';
import { DanhMucKhacService } from './services/danh-muc-khac.service';
import { TokenStorage } from 'app/core/auth/_services/token-storage.service';

@Component({
  selector: 'kt-danh-muc-khac',
  templateUrl: './danh-muc-khac.component.html'
})
export class DanhMucKhacComponent implements OnInit {

	constructor(private objectService: DanhMucKhacService, private tokenStorage: TokenStorage) { }

	filterprovinces: number
	ngOnInit() {
		this.tokenStorage.getUserInfo().subscribe(res => {
			this.filterprovinces = res.IdTinh;
		})
		if (this.objectService !== undefined) {
			this.objectService.lastFilter$ = new BehaviorSubject(new QueryParamsModel({}, 'asc', 'MaLoaiHoSo', 0, 10));
			this.objectService.lastFilterTC$ = new BehaviorSubject(new QueryParamsModel({}, 'asc', 'MaTroCap', 0, 10));
		}
  }

}
