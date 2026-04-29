import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { BaseDataSource, QueryParamsModel, QueryResultsModel } from '../../../../../../../core/_base/crud';
import { BieuMauQuaService } from '../../Services/bieu-mau-qua.service';
import { BieuMauService } from '../../Services/bieu-mau.service';
import { CanCuService } from '../../Services/can-cu.service';

export class CanCuBieuMauDataSource extends BaseDataSource {

	constructor(
		private bmServices: BieuMauService | null = null,
		private ccServices: CanCuService | null = null,
		private bmQuaServices: BieuMauQuaService | null = null) {
		super();
	}

	loadListCanCu(queryParams: QueryParamsModel) {
		let apiService = this.ccServices;
		if (!apiService) return;
		apiService.lastFilter$.next(queryParams);
		this.loadingSubject.next(true);
		apiService.findData(queryParams)
			.pipe(
				tap(res => {
					this.entitySubject.next(res.data);
					var totalCount = res.page.TotalCount || (res.page.AllPage * res.page.Size);
					this.paginatorTotalSubject.next(totalCount);
				}),
				catchError(err => of(new QueryResultsModel([], err))),
				finalize(() => this.loadingSubject.next(false))
			).subscribe(res => {
				apiService.ReadOnlyControl = res.Visible;
			}
		);
	}

	loadListBieuMau(queryParams: QueryParamsModel) {
		let apiService = this.bmServices;
		if (!apiService) return;
		apiService.lastFilter$.next(queryParams);
		this.loadingSubject.next(true);
		apiService.findData(queryParams)
			.pipe(
				tap(res => {
					this.entitySubject.next(res.data);
					var totalCount = res.page.TotalCount || (res.page.AllPage * res.page.Size);
					this.paginatorTotalSubject.next(totalCount);
				}),
				catchError(err => of(new QueryResultsModel([], err))),
				finalize(() => this.loadingSubject.next(false))
			).subscribe(res => {
				apiService.ReadOnlyControl = res.Visible;
			}
		);
	}

	loadListTP(queryParams: QueryParamsModel) {
		let apiService = this.bmServices;
		if (!apiService) return;
		apiService.lastFilter$.next(queryParams);
		this.loadingSubject.next(true);
		apiService.findDataTP(queryParams)
			.pipe(
				tap(res => {
					this.entitySubject.next(res.data);
					var totalCount = res.page.TotalCount || (res.page.AllPage * res.page.Size);
					this.paginatorTotalSubject.next(totalCount);
				}),
				catchError(err => of(new QueryResultsModel([], err))),
				finalize(() => this.loadingSubject.next(false))
			).subscribe(res => {
				apiService.ReadOnlyControl = res.Visible;
			}
		);
	}

	loadListBieuMauQua(queryParams: QueryParamsModel) {
		let apiService = this.bmQuaServices;
		if (!apiService) return;
		apiService.lastFilter$.next(queryParams);
		this.loadingSubject.next(true);
		apiService.findData(queryParams)
			.pipe(
				tap(res => {
					this.entitySubject.next(res.data);
					var totalCount = res.page.TotalCount || (res.page.AllPage * res.page.Size);
					this.paginatorTotalSubject.next(totalCount);
				}),
				catchError(err => of(new QueryResultsModel([], err))),
				finalize(() => this.loadingSubject.next(false))
			).subscribe(res => {
				apiService.ReadOnlyControl = res.Visible;
			}
		);
	}
}