import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { BaseDataSource, QueryParamsModel, QueryResultsModel } from '../../../../../../../core/_base/crud';
import { DeXuatDuyetService } from '../../Services/de-xuat-duyet.service';

export class DeXuatDuyetDataSource extends BaseDataSource {
	constructor(private DeXuatService: DeXuatDuyetService) {
		super();
	}

	loadList(queryParams: QueryParamsModel, cap: number = 3) {
		this.DeXuatService.lastFilter$.next(queryParams);
		this.loadingSubject.next(true);
		this.DeXuatService.findData(queryParams, cap)
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
