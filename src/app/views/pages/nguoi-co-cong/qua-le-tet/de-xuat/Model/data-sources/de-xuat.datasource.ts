import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { BaseDataSource, QueryParamsModel, QueryResultsModel } from '../../../../../../../core/_base/crud';
import { DeXuatService } from '../../Services/de-xuat.service';

export class DeXuatDataSource extends BaseDataSource {
	constructor(private apiService: DeXuatService) {
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