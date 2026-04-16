import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { dutoankinhphiService } from '../../Services/du-toan-kinh-phi.service';
import { BaseDataSource, QueryParamsModel, QueryResultsModel } from '../../../../../../../core/_base/crud';

export class dutoankinhphiDataSource extends BaseDataSource {
	constructor(private dutoankinhphiService: dutoankinhphiService) {
		super();
	}

	loadList(queryParams: QueryParamsModel) {
		this.dutoankinhphiService.lastFilter$.next(queryParams);
		this.loadingSubject.next(true);
		this.dutoankinhphiService.findData(queryParams)
			.pipe(
				tap(resultFromServer => {
					this.entitySubject.next(resultFromServer.data);
					var totalCount = resultFromServer.page.TotalCount || (resultFromServer.page.AllPage * resultFromServer.page.Size);
					this.paginatorTotalSubject.next(totalCount);
				}),
				catchError(err => of(new QueryResultsModel([], err))),
				finalize(() => this.loadingSubject.next(false))
			).subscribe(res => {
				this.dutoankinhphiService.ReadOnlyControl = res.Visible;
			});
	}
}
