import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { BaseDataSource, QueryParamsModel, QueryResultsModel } from '../../../../../../../core/_base/crud';
import { donvihanhchinhService } from '../../Services/donvihanhchinh.service';

export class donvihanhchinhDataSource extends BaseDataSource {
	constructor(private apiService: donvihanhchinhService) {
		super();
	}

	loadListprovices(queryParams: QueryParamsModel) {
		this.apiService.lastFilter$.next(queryParams);
		this.loadingSubject.next(true);
		this.apiService.findDataProvinces(queryParams)
			.pipe(
				tap(res => {
					this.entitySubject.next(res.data);
					var totalCount = res.page.TotalCount || (res.page.AllPage * res.page.Size);
					this.paginatorTotalSubject.next(totalCount);
				}),
				catchError(err => of(new QueryResultsModel([], err))),
				finalize(() => this.loadingSubject.next(false))
			).subscribe(res => {
				this.apiService.ReadOnlyControl = res.Visible;
			}
		);
	}

	loadListward(queryParams: QueryParamsModel) {
		this.apiService.lastFilter$.next(queryParams);
		this.loadingSubject.next(true);
		this.apiService.findDataWard(queryParams)
			.pipe(
				tap(res => {
					this.entitySubject.next(res.data);
					var totalCount = res.page.TotalCount || (res.page.AllPage * res.page.Size);
					this.paginatorTotalSubject.next(totalCount);
				}),
				catchError(err => of(new QueryResultsModel([], err))),
				finalize(() => this.loadingSubject.next(false))
			).subscribe(res => {
				this.apiService.ReadOnlyControl = res.Visible;
			}
		);
	}

	loadListKhomAp(queryParams: QueryParamsModel) {
		this.apiService.lastFilter$.next(queryParams);
		this.loadingSubject.next(true);
		this.apiService.findDataKhomAp(queryParams)
			.pipe(
				tap(res => {
					this.entitySubject.next(res.data);
					var totalCount = res.page.TotalCount || (res.page.AllPage * res.page.Size);
					this.paginatorTotalSubject.next(totalCount);
				}),
				catchError(err => of(new QueryResultsModel([], err))),
				finalize(() => this.loadingSubject.next(false))
			).subscribe(res => {
				this.apiService.ReadOnlyControl = res.Visible;
			}
		);
	}
}