import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { chedouudaiService } from '../../Services/che-do-uu-dai.service';
import { BaseDataSource, QueryParamsModel, QueryResultsModel } from '../../../../../../../core/_base/crud';

export class chedouudaiDataSource extends BaseDataSource {
	constructor(private apiService: chedouudaiService) {
		super();
	}

	loadList(queryParams: QueryParamsModel) {
		this.apiService.lastFilter$.next(queryParams);
		this.loadingSubject.next(true);
		this.apiService.findData(queryParams)
			.pipe(
				tap(res => {
					this.entitySubject.next(res.data);
					var totalCount = res.page.TotalCount || (res.page.AllPage * res.page.Size);
					this.paginatorTotalSubject.next(totalCount);
				}),
				catchError(err => of(new QueryResultsModel([], err))),
				finalize(() => this.loadingSubject.next(false))
			).subscribe(res => {
				this.apiService.ReadOnlyControl = res.Visible;
			}
		);
	}
}