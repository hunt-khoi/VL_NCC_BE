import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { BaseDataSource, QueryParamsModel, QueryResultsModel } from '../../../../../../../core/_base/crud';
import { NhapQuyTrinhDuyetService } from '../../Services/nhap-quy-trinh-duyet.service';


export class NhapQuyTrinhDuyetDataSource extends BaseDataSource {
	constructor(private apiService: NhapQuyTrinhDuyetService) {
		super();
	}

	loadList(queryParams: QueryParamsModel) {
		this.apiService.lastFilter$.next(queryParams);
		this.loadingSubject.next(true);
		this.apiService.findData(queryParams)
			.pipe(
				tap(res => {
					this.entitySubject.next(res.data);
					var totalCount = res.page.TotalCount || (res.page.AllPage * res.page.Size);
					this.paginatorTotalSubject.next(totalCount);
				}),
				catchError(err => of(new QueryResultsModel([], err))),
				finalize(() => this.loadingSubject.next(false))
			).subscribe(
				res => {
					this.apiService.VisibleQTD = res.Visible;
				}
			);
	}

	loadListCapQuanLy(queryParams: QueryParamsModel) {
		this.apiService.lastFilter$.next(queryParams);
		this.loadingSubject.next(true);
		this.apiService.findDataCapQuanLy(queryParams)
			.pipe(
				tap(res => {
					this.entitySubject.next(res.data);
					var totalCount = res.page.TotalCount || (res.page.AllPage * res.page.Size);
					this.paginatorTotalSubject.next(totalCount);
				}),
				catchError(err => of(new QueryResultsModel([], err))),
				finalize(() => this.loadingSubject.next(false))
			).subscribe(
				res => {
					this.apiService.VisibleCQL = res.Visible;
				}
			);
	}

	loadListDieuKien(queryParams: QueryParamsModel) {
		this.apiService.lastFilter1$.next(queryParams);
		this.loadingSubject.next(true);
		this.apiService.findDataDieuKien(queryParams)
			.pipe(
				tap(res => {
					this.entitySubject.next(res.data);
					var totalCount = res.page.TotalCount || (res.page.AllPage * res.page.Size);
					this.paginatorTotalSubject.next(totalCount);
				}),
				catchError(err => of(new QueryResultsModel([], err))),
				finalize(() => this.loadingSubject.next(false))
			).subscribe(
				res => {
					this.apiService.VisibleCQL = res.Visible;
				}
			);
	}
}