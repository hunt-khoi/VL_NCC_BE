import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { dotnienhanService } from '../../Services/dot-nien-han.service';
import { BaseDataSource, QueryParamsModel, QueryResultsModel } from '../../../../../../../core/_base/crud';

export class dotnienhanDataSource extends BaseDataSource {
	constructor(private dotnienhanService: dotnienhanService) {
		super();
	}

	loadList(queryParams: QueryParamsModel) {
		this.dotnienhanService.lastFilter$.next(queryParams);
		this.loadingSubject.next(true);
		this.dotnienhanService.findData(queryParams)
			.pipe(
				tap(resultFromServer => {
					this.entitySubject.next(resultFromServer.data);
					var totalCount = resultFromServer.page.TotalCount || (resultFromServer.page.AllPage * resultFromServer.page.Size);
					this.paginatorTotalSubject.next(totalCount);
				}),
				catchError(err => of(new QueryResultsModel([], err))),
				finalize(() => this.loadingSubject.next(false))
			).subscribe(res => {
				this.dotnienhanService.ReadOnlyControl = res.Visible;
			});
	}
}
