import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { BaseDataSource, QueryParamsModel, QueryResultsModel } from '../../../../../../../core/_base/crud';
import { QuyetDinhService } from '../../Services/quyet-dinh.service';

export class QuyetDinhDataSource extends BaseDataSource {
	constructor(private objectService: QuyetDinhService) {
		super();
	}

	loadList(queryParams: QueryParamsModel) {
		this.objectService.lastFilter$.next(queryParams);
		this.loadingSubject.next(true);

		this.objectService.findData(queryParams)
			.pipe(
				tap(resultFromServer => {
					this.entitySubject.next(resultFromServer.data);
					const totalCount = resultFromServer.page.TotalCount || (resultFromServer.page.AllPage * resultFromServer.page.Size);
					this.paginatorTotalSubject.next(totalCount);
				}),
				catchError(err => of(new QueryResultsModel([], err))),
				finalize(() => this.loadingSubject.next(false))
			).subscribe(res => {
				this.objectService.ReadOnlyControl = res.Visible;
			});
	}
	loadListNCC(queryParams: QueryParamsModel) {
		this.objectService.lastFilter$.next(queryParams);
		this.loadingSubject.next(true);

		this.objectService.findDataNCC(queryParams)
			.pipe(
				tap(resultFromServer => {
					this.entitySubject.next(resultFromServer.data);
					const totalCount = resultFromServer.page.TotalCount || (resultFromServer.page.AllPage * resultFromServer.page.Size);
					this.paginatorTotalSubject.next(totalCount);
				}),
				catchError(err => of(new QueryResultsModel([], err))),
				finalize(() => this.loadingSubject.next(false))
			).subscribe(res => {
				this.objectService.ReadOnlyControl = res.Visible;
			});
	}
}
