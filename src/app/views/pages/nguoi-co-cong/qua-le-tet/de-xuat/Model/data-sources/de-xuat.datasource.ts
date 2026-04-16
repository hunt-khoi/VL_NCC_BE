import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { DeXuatService } from '../../Services/de-xuat.service';
import { BaseDataSource, QueryParamsModel, QueryResultsModel } from '../../../../../../../core/_base/crud';

export class DeXuatDataSource extends BaseDataSource {
	constructor(private DeXuatService: DeXuatService) {
		super();
	}

	loadList(queryParams: QueryParamsModel) {
		this.DeXuatService.lastFilter$.next(queryParams);
		this.loadingSubject.next(true);
		this.DeXuatService.findData(queryParams)
			.pipe(
				tap(resultFromServer => {
					this.entitySubject.next(resultFromServer.data);
					var totalCount = resultFromServer.page.TotalCount || (resultFromServer.page.AllPage * resultFromServer.page.Size);
					this.paginatorTotalSubject.next(totalCount);
				}),
				catchError(err => of(new QueryResultsModel([], err))),
				finalize(() => this.loadingSubject.next(false))
			).subscribe(res => {
				this.DeXuatService.ReadOnlyControl = res.Visible;
			});
	}
}
