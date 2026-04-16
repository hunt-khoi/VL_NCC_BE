import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { BaseDataSource, QueryParamsModel, QueryResultsModel } from '../../../../../../../core/_base/crud';
import { dantocService } from '../../Services/dantoc.service';

export class dantocDataSource extends BaseDataSource {
	constructor(private dantocService: dantocService) {
		super();
	}

	loadList(queryParams: QueryParamsModel) {
		this.dantocService.lastFilter$.next(queryParams);
		this.loadingSubject.next(true);

		this.dantocService.findData(queryParams)
			.pipe(
				tap(resultFromServer => {
					this.entitySubject.next(resultFromServer.data);
					var totalCount = resultFromServer.page.TotalCount || (resultFromServer.page.AllPage * resultFromServer.page.Size);
					this.paginatorTotalSubject.next(totalCount);
				}),
				catchError(err => of(new QueryResultsModel([], err))),
				finalize(() => this.loadingSubject.next(false))
			).subscribe(res => {
				this.dantocService.ReadOnlyControl = res.Visible;
			});
	}
}
