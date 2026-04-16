import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { BaseDataSource, QueryParamsModel, QueryResultsModel } from '../../../../../../../core/_base/crud';
import { NhapQuyTrinhDuyetService } from '../../Services/nhap-quy-trinh-duyet.service';


export class NhapQuyTrinhDuyetDataSource extends BaseDataSource {
	constructor(private nhapQuyTrinhDuyetService: NhapQuyTrinhDuyetService) {
		super();
	}

	loadList(queryParams: QueryParamsModel) {
		this.nhapQuyTrinhDuyetService.lastFilter$.next(queryParams);
		this.loadingSubject.next(true);

		this.nhapQuyTrinhDuyetService.findData(queryParams)
			.pipe(
				tap(resultFromServer => {
					this.entitySubject.next(resultFromServer.data);
					var totalCount = resultFromServer.page.TotalCount || (resultFromServer.page.AllPage * resultFromServer.page.Size);
					this.paginatorTotalSubject.next(totalCount);
				}),
				catchError(err => of(new QueryResultsModel([], err))),
				finalize(() => this.loadingSubject.next(false))
			).subscribe(
				res => {
					this.nhapQuyTrinhDuyetService.VisibleQTD = res.Visible;
				}
			);
	}

	loadListCapQuanLy(queryParams: QueryParamsModel) {
		this.nhapQuyTrinhDuyetService.lastFilter$.next(queryParams);
		this.loadingSubject.next(true);

		this.nhapQuyTrinhDuyetService.findDataCapQuanLy(queryParams)
			.pipe(
				tap(resultFromServer => {
					this.entitySubject.next(resultFromServer.data);
					var totalCount = resultFromServer.page.TotalCount || (resultFromServer.page.AllPage * resultFromServer.page.Size);
					this.paginatorTotalSubject.next(totalCount);
				}),
				catchError(err => of(new QueryResultsModel([], err))),
				finalize(() => this.loadingSubject.next(false))
			).subscribe(
				res => {
					 
					this.nhapQuyTrinhDuyetService.VisibleCQL = res.Visible;
				}
			);
	}

	loadListDieuKien(queryParams: QueryParamsModel) {
		this.nhapQuyTrinhDuyetService.lastFilter1$.next(queryParams);
		this.loadingSubject.next(true);

		this.nhapQuyTrinhDuyetService.findDataDieuKien(queryParams)
			.pipe(
				tap(resultFromServer => {
					this.entitySubject.next(resultFromServer.data);
					var totalCount = resultFromServer.page.TotalCount || (resultFromServer.page.AllPage * resultFromServer.page.Size);
					this.paginatorTotalSubject.next(totalCount);
				}),
				catchError(err => of(new QueryResultsModel([], err))),
				finalize(() => this.loadingSubject.next(false))
			).subscribe(
				res => {
					 
					this.nhapQuyTrinhDuyetService.VisibleCQL = res.Visible;
				}
			);
	}
}
