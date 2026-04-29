import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { capquanlyService } from '../../Services/capquanly.service';
import { BaseDataSource, QueryParamsModel, QueryResultsModel } from '../../../../../../../core/_base/crud';

export class capquanlyDataSource extends BaseDataSource {
	constructor(private capquanlyService: capquanlyService) {
		super();
	}

	loadList(queryParams: QueryParamsModel) {
		this.capquanlyService.lastFilter$.next(queryParams);
		this.loadingSubject.next(true);
		this.capquanlyService.findData(queryParams)
			.pipe(
				tap(res => {
					this.entitySubject.next(res.data);
				var totalCount = res.page.TotalCount || (res.page.AllPage * res.page.Size);
					this.paginatorTotalSubject.next(totalCount);
				}),
				catchError(err => of(new QueryResultsModel([], err))),
				finalize(() => this.loadingSubject.next(false))
			).subscribe(res => {
				this.capquanlyService.ReadOnlyControl = res.Visible;
			}
		);
	}
}