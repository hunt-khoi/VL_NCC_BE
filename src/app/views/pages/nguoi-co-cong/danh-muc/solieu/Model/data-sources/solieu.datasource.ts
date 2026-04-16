import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { solieuService } from '../../Services/solieu.service';
import { BaseDataSource, QueryParamsModel, QueryResultsModel } from '../../../../../../../core/_base/crud';

export class solieuDataSource extends BaseDataSource {
	constructor(private solieuService: solieuService) {
		super();
	}

	loadList(queryParams: QueryParamsModel) {
		this.solieuService.lastFilter$.next(queryParams);
		this.loadingSubject.next(true);
		this.solieuService.findData(queryParams)
			.pipe(
				tap(resultFromServer => {
					this.entitySubject.next(resultFromServer.data);
					var totalCount = resultFromServer.page.TotalCount || (resultFromServer.page.AllPage * resultFromServer.page.Size);
					this.paginatorTotalSubject.next(totalCount);
				}),
				catchError(err => of(new QueryResultsModel([], err))),
				finalize(() => this.loadingSubject.next(false))
			).subscribe(res => {
				this.solieuService.ReadOnlyControl = res.Visible;
			});
	}
}
