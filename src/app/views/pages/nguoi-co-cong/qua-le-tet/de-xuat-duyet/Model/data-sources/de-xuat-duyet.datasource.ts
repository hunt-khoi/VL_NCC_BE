import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { BaseDataSource, QueryParamsModel, QueryResultsModel } from '../../../../../../../core/_base/crud';
import { DeXuatDuyetService } from '../../Services/de-xuat-duyet.service';

export class DeXuatDuyetDataSource extends BaseDataSource {
	constructor(private apiService: DeXuatDuyetService) {
		super();
	}

	loadList(queryParams: QueryParamsModel, cap: number = 3) {
		this.apiService.lastFilter$.next(queryParams);
		this.loadingSubject.next(true);
		this.apiService.findData(queryParams, cap)
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