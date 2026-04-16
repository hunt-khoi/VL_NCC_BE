import { NienHanDoiTuongService } from './../../Services/nien-han-doi-tuong.service';
import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { BaseDataSource, QueryParamsModel, QueryResultsModel } from '../../../../../../../core/_base/crud';

export class NienHanDoiTuongDataSource extends BaseDataSource {
	constructor(private NienHanDoiTuongService: NienHanDoiTuongService) {
		super();
	}

	loadListQL(queryParams: QueryParamsModel) {
		this.NienHanDoiTuongService.lastFilter$.next(queryParams);
		this.loadingSubject.next(true);

		this.NienHanDoiTuongService.findDataQL(queryParams)
			.pipe(
				tap(resultFromServer => {
					this.entitySubject.next(resultFromServer.data);
					const totalCount = resultFromServer.page.TotalCount || (resultFromServer.page.AllPage * resultFromServer.page.Size);
					this.paginatorTotalSubject.next(totalCount);
				}),
				catchError(err => of(new QueryResultsModel([], err))),
				finalize(() => this.loadingSubject.next(false))
			).subscribe(res => {
				this.NienHanDoiTuongService.ReadOnlyControl = res.Visible;
			});
	}

	loadListCap(queryParams: QueryParamsModel) {
		this.NienHanDoiTuongService.lastFilter$.next(queryParams);
		this.loadingSubject.next(true);

		this.NienHanDoiTuongService.findDataDaCap(queryParams)
			.pipe(
				tap(resultFromServer => {
					this.entitySubject.next(resultFromServer.data);
					const totalCount = resultFromServer.page.TotalCount || (resultFromServer.page.AllPage * resultFromServer.page.Size);
					this.paginatorTotalSubject.next(totalCount);
				}),
				catchError(err => of(new QueryResultsModel([], err))),
				finalize(() => this.loadingSubject.next(false))
			).subscribe(res => {
				this.NienHanDoiTuongService.ReadOnlyControl = res.Visible;
			});
	}
}
