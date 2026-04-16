import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { nhomletetService } from '../../Services/nhomletet.service';
import { BaseDataSource, QueryParamsModel, QueryResultsModel } from '../../../../../../../core/_base/crud';

export class nhomletetDataSource extends BaseDataSource {
	constructor(private nhomletetService: nhomletetService) {
		super();
	}

	loadList(queryParams: QueryParamsModel) {
		this.nhomletetService.lastFilter$.next(queryParams);
		this.loadingSubject.next(true);
		this.nhomletetService.findData(queryParams)
			.pipe(
				tap(resultFromServer => {
					this.entitySubject.next(resultFromServer.data);
					var totalCount = resultFromServer.page.TotalCount || (resultFromServer.page.AllPage * resultFromServer.page.Size);
					this.paginatorTotalSubject.next(totalCount);
				}),
				catchError(err => of(new QueryResultsModel([], err))),
				finalize(() => this.loadingSubject.next(false))
			).subscribe(res => {
				this.nhomletetService.ReadOnlyControl = res.Visible;
			});
	}
}
