import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { BaseDataSource, QueryParamsModel, QueryResultsModel } from '../../../../../../../core/_base/crud';
import { filterService } from '../../Services/filter.service';

export class FilterDataSource extends BaseDataSource {
	constructor(private filterService: filterService) {
		super();
	}

	loadList(queryParams: QueryParamsModel) {
		this.filterService.lastFilter$.next(queryParams);
		this.loadingSubject.next(true);
		this.filterService.findData(queryParams)
			.pipe(
				tap(resultFromServer => {
					this.entitySubject.next(resultFromServer.data);
					var totalCount = resultFromServer.page.TotalCount || (resultFromServer.page.AllPage * resultFromServer.page.Size);
					this.paginatorTotalSubject.next(totalCount);
				}),
				catchError(err => of(new QueryResultsModel([], err))),
				finalize(() => this.loadingSubject.next(false))
			).subscribe(res => {
				this.filterService.ReadOnlyControl = res.Visible;
			});
	}
}
