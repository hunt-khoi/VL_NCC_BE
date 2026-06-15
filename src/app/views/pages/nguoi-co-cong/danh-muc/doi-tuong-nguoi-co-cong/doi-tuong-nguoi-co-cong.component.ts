import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { QueryParamsModel } from 'app/core/_base/crud';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TokenStorage } from 'app/core/auth/_services/token-storage.service';
import { DoiTuongNguoiCoCongService } from './Services/doi-tuong-nguoi-co-cong.service';


@Component({
	selector: 'kt-doi-tuong-nguoi-co-cong',
	templateUrl: './doi-tuong-nguoi-co-cong.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class DoiTuongNguoiCoCongComponent implements OnInit, OnDestroy {
	private destroy$ = new Subject<void>();
	
	constructor(public apiService: DoiTuongNguoiCoCongService, private tokenStorage: TokenStorage) { }
	filterprovinces: number = 0;
	
	ngOnInit() {
		this.tokenStorage.getUserInfo().pipe(takeUntil(this.destroy$)).subscribe(res => {
			this.filterprovinces = res.IdTinh;
		})
		if (this.apiService !== undefined) {
			this.apiService.lastFilter$ = new BehaviorSubject(new QueryParamsModel({}, 'asc', 'Priority', 0, 10));
		}
	}

	ngOnDestroy() {
		this.destroy$.next();
		this.destroy$.complete();
	}
}