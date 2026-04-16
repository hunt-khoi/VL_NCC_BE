import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { cachNhapService } from '../../Services/cachnhap.service';
import { BaseDataSource, QueryParamsModel, QueryResultsModel } from '../../../../../../../core/_base/crud';

export class cachnhapDataSource extends BaseDataSource {
	constructor(private cachNhapService: cachNhapService) {
		super();
	}

	loadList(queryParams: QueryParamsModel) {
		this.cachNhapService.lastFilter$.next(queryParams);
		this.loadingSubject.next(true);
		this.cachNhapService.findData(queryParams)
			.pipe(
				tap(resultFromServer => {
					this.entitySubject.next(resultFromServer.data);
					var totalCount = resultFromServer.page.TotalCount || (resultFromServer.page.AllPage * resultFromServer.page.Size);
					this.paginatorTotalSubject.next(totalCount);
				}),
				catchError(err => of(new QueryResultsModel([], err))),
				finalize(() => this.loadingSubject.next(false))
			).subscribe(res => {
				this.cachNhapService.ReadOnlyControl = res.Visible;
			});
	}
}
