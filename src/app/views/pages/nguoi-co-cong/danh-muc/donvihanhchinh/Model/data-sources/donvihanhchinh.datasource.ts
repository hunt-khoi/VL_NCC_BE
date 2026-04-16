import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { BaseDataSource, QueryParamsModel, QueryResultsModel } from '../../../../../../../core/_base/crud';
import { donvihanhchinhService } from '../../Services/donvihanhchinh.service';

export class donvihanhchinhDataSource extends BaseDataSource {
	constructor(private _services: donvihanhchinhService,
	) {
		super();
	}
	loadListprovices(queryParams: QueryParamsModel) {
		this._services.lastFilter$.next(queryParams);
		this.loadingSubject.next(true);

		this._services.findDataProvinces(queryParams)
			.pipe(
				tap(resultFromServer => {
					this.entitySubject.next(resultFromServer.data);
					var totalCount = resultFromServer.page.TotalCount || (resultFromServer.page.AllPage * resultFromServer.page.Size);
					this.paginatorTotalSubject.next(totalCount);
				}),
				catchError(err => of(new QueryResultsModel([], err))),
				finalize(() => this.loadingSubject.next(false))
		).subscribe(res => {
			this._services.ReadOnlyControl = res.Visible;
			});
	}
	loadListDistrict(queryParams: QueryParamsModel) {
		this._services.lastFilter$.next(queryParams);
		this.loadingSubject.next(true);

		this._services.findDataDistrict(queryParams)
			.pipe(
				tap(resultFromServer => {
					this.entitySubject.next(resultFromServer.data);
					var totalCount = resultFromServer.page.TotalCount || (resultFromServer.page.AllPage * resultFromServer.page.Size);
					this.paginatorTotalSubject.next(totalCount);
				}),
				catchError(err => of(new QueryResultsModel([], err))),
				finalize(() => this.loadingSubject.next(false))
		).subscribe(res => {
			this._services.ReadOnlyControl = res.Visible;
			});
	}
	loadListward(queryParams: QueryParamsModel) {
		this._services.lastFilter$.next(queryParams);
		this.loadingSubject.next(true);

		this._services.findDataWard(queryParams)
			.pipe(
				tap(resultFromServer => {
					this.entitySubject.next(resultFromServer.data);
					var totalCount = resultFromServer.page.TotalCount || (resultFromServer.page.AllPage * resultFromServer.page.Size);
					this.paginatorTotalSubject.next(totalCount);
				}),
				catchError(err => of(new QueryResultsModel([], err))),
				finalize(() => this.loadingSubject.next(false))
		).subscribe(res => {
			this._services.ReadOnlyControl = res.Visible;
			});
	}
	loadListKhomAp(queryParams: QueryParamsModel) {
		this._services.lastFilter$.next(queryParams);
		this.loadingSubject.next(true);

		this._services.findDataKhomAp(queryParams)
			.pipe(
				tap(resultFromServer => {
					this.entitySubject.next(resultFromServer.data);
					var totalCount = resultFromServer.page.TotalCount || (resultFromServer.page.AllPage * resultFromServer.page.Size);
					this.paginatorTotalSubject.next(totalCount);
				}),
				catchError(err => of(new QueryResultsModel([], err))),
				finalize(() => this.loadingSubject.next(false))
		).subscribe(res => {
			this._services.ReadOnlyControl = res.Visible;
			});
	}
}
