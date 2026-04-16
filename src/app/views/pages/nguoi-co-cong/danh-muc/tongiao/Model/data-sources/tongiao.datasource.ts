import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { BaseDataSource, QueryParamsModel, QueryResultsModel } from '../../../../../../../core/_base/crud';
import { tongiaoService } from '../../Services/tongiao.service';

export class tongiaoDataSource extends BaseDataSource {
	constructor(private tongiaoService: tongiaoService) {
		super();
	}

	loadList(queryParams: QueryParamsModel) {
		this.tongiaoService.lastFilter$.next(queryParams);
		this.loadingSubject.next(true);

		this.tongiaoService.findData(queryParams)
			.pipe(
				tap(resultFromServer => {
					this.entitySubject.next(resultFromServer.data);
				var totalCount = resultFromServer.page.TotalCount || (resultFromServer.page.AllPage * resultFromServer.page.Size);
					this.paginatorTotalSubject.next(totalCount);
				}),
				catchError(err => of(new QueryResultsModel([], err))),
				finalize(() => this.loadingSubject.next(false))
			).subscribe(res => {
				
				this.tongiaoService.ReadOnlyControl = res.Visible;
			});
	}
}
