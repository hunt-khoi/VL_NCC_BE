import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { dottangquaService } from '../../Services/dot-tang-qua.service';
import { BaseDataSource, QueryParamsModel, QueryResultsModel } from '../../../../../../../core/_base/crud';

export class dottangquaDataSource extends BaseDataSource {
	constructor(private dottangquaService: dottangquaService) {
		super();
	}

	loadList(queryParams: QueryParamsModel) {
		this.dottangquaService.lastFilter$.next(queryParams);
		this.loadingSubject.next(true);
		this.dottangquaService.findData(queryParams)
			.pipe(
				tap(resultFromServer => {
					this.entitySubject.next(resultFromServer.data);
					var totalCount = resultFromServer.page.TotalCount || (resultFromServer.page.AllPage * resultFromServer.page.Size);
					this.paginatorTotalSubject.next(totalCount);
				}),
				catchError(err => of(new QueryResultsModel([], err))),
				finalize(() => this.loadingSubject.next(false))
			).subscribe(res => {
				this.dottangquaService.ReadOnlyControl = res.Visible;
			});
	}
}
