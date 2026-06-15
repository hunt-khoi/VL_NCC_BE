import { Component, OnInit, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { QueryParamsModel } from '../../../../../core/_base/crud';
import { TokenStorage } from 'app/core/auth/_services/token-storage.service';
import { DanhMucKhacService } from './Services/danh-muc-khac.service';

@Component({
  selector: 'kt-danh-muc-khac',
  templateUrl: './danh-muc-khac.component.html'
})
export class DanhMucKhacComponent implements OnInit, OnDestroy {
	private destroy$ = new Subject<void>();

	constructor(private objectService: DanhMucKhacService, private tokenStorage: TokenStorage) { }

	filterprovinces: number = 0;
	ngOnInit() {
		this.tokenStorage.getUserInfo().pipe(takeUntil(this.destroy$)).subscribe(res => {
			this.filterprovinces = res.IdTinh;
		})
		if (this.objectService !== undefined) {
			this.objectService.lastFilter$ = new BehaviorSubject(new QueryParamsModel({}, 'asc', 'MaLoaiHoSo', 0, 10));
			this.objectService.lastFilterTC$ = new BehaviorSubject(new QueryParamsModel({}, 'asc', 'MaTroCap', 0, 10));
		}
  	}

	ngOnDestroy() {
		this.destroy$.next();
		this.destroy$.complete();
	}
}