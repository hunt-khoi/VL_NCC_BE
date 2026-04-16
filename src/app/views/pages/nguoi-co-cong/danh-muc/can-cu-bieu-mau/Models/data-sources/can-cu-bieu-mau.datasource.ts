import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { BaseDataSource, QueryParamsModel, QueryResultsModel } from '../../../../../../../core/_base/crud';
import { BieuMauQuaService } from '../../services/bieu-mau-qua.service';
import { BieuMauService } from '../../services/bieu-mau.service';
import { CanCuService } from '../../services/can-cu.service';

export class CanCuBieuMauDataSource extends BaseDataSource {
	constructor(private bmServices: BieuMauService,
		private ccServices: CanCuService,
		private bmQuaServices:BieuMauQuaService=null) {
		super();
	}

	loadListCanCu(queryParams: QueryParamsModel) {
		this.ccServices.lastFilter$.next(queryParams);
		this.loadingSubject.next(true);

		this.ccServices.findData(queryParams)
			.pipe(
				tap(resultFromServer => {
					this.entitySubject.next(resultFromServer.data);
					var totalCount = resultFromServer.page.TotalCount || (resultFromServer.page.AllPage * resultFromServer.page.Size);
					this.paginatorTotalSubject.next(totalCount);
				}),
				catchError(err => of(new QueryResultsModel([], err))),
				finalize(() => this.loadingSubject.next(false))
			).subscribe(res => {
				this.ccServices.ReadOnlyControl = res.Visible;
			});
	}
	loadListBieuMau(queryParams: QueryParamsModel) {
		this.bmServices.lastFilter$.next(queryParams);
		this.loadingSubject.next(true);

		this.bmServices.findData(queryParams)
			.pipe(
				tap(resultFromServer => {
					this.entitySubject.next(resultFromServer.data);
					var totalCount = resultFromServer.page.TotalCount || (resultFromServer.page.AllPage * resultFromServer.page.Size);
					this.paginatorTotalSubject.next(totalCount);
				}),
				catchError(err => of(new QueryResultsModel([], err))),
				finalize(() => this.loadingSubject.next(false))
			).subscribe(res => {
				this.bmServices.ReadOnlyControl = res.Visible;
			});
	}
	loadListTP(queryParams: QueryParamsModel) {
		this.bmServices.lastFilter$.next(queryParams);
		this.loadingSubject.next(true);

		this.bmServices.findDataTP(queryParams)
			.pipe(
				tap(resultFromServer => {
					this.entitySubject.next(resultFromServer.data);
					var totalCount = resultFromServer.page.TotalCount || (resultFromServer.page.AllPage * resultFromServer.page.Size);
					this.paginatorTotalSubject.next(totalCount);
				}),
				catchError(err => of(new QueryResultsModel([], err))),
				finalize(() => this.loadingSubject.next(false))
			).subscribe(res => {
				this.bmServices.ReadOnlyControl = res.Visible;
			});
	}
	loadListBieuMauQua(queryParams: QueryParamsModel) {
		this.bmQuaServices.lastFilter$.next(queryParams);
		this.loadingSubject.next(true);

		this.bmQuaServices.findData(queryParams)
			.pipe(
				tap(resultFromServer => {
					this.entitySubject.next(resultFromServer.data);
					var totalCount = resultFromServer.page.TotalCount || (resultFromServer.page.AllPage * resultFromServer.page.Size);
					this.paginatorTotalSubject.next(totalCount);
				}),
				catchError(err => of(new QueryResultsModel([], err))),
				finalize(() => this.loadingSubject.next(false))
			).subscribe(res => {
				this.bmQuaServices.ReadOnlyControl = res.Visible;
			});
	}
}
