import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { dungcuchinhhinhService } from '../../Services/dungcuchinhhinh.service';
import { BaseDataSource, QueryParamsModel, QueryResultsModel } from '../../../../../../../core/_base/crud';

export class dungcuchinhhinhDataSource extends BaseDataSource {
	constructor(private dungcuchinhhinhService: dungcuchinhhinhService) {
		super();
	}

	loadList(queryParams: QueryParamsModel) {
		this.dungcuchinhhinhService.lastFilter$.next(queryParams);
		this.loadingSubject.next(true);
		this.dungcuchinhhinhService.findData(queryParams)
			.pipe(
				tap(resultFromServer => {
					this.entitySubject.next(resultFromServer.data);
					var totalCount = resultFromServer.page.TotalCount || (resultFromServer.page.AllPage * resultFromServer.page.Size);
					this.paginatorTotalSubject.next(totalCount);
				}),
				catchError(err => of(new QueryResultsModel([], err))),
				finalize(() => this.loadingSubject.next(false))
			).subscribe(res => {
				this.dungcuchinhhinhService.ReadOnlyControl = res.Visible;
			});
	}
}
