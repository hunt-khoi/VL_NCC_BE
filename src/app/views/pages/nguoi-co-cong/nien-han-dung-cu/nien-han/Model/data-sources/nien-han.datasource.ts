import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { NienHanService } from '../../Services/nien-han.service';
import { BaseDataSource, QueryParamsModel, QueryResultsModel } from '../../../../../../../core/_base/crud';

export class NienHanDataSource extends BaseDataSource {
	constructor(private NienHanService: NienHanService) {
		super();
	}

	loadList(queryParams: QueryParamsModel, cap: number=2) {
		this.NienHanService.lastFilter$.next(queryParams);
		this.loadingSubject.next(true);
		this.NienHanService.findData(queryParams, cap)
			.pipe(
				tap(resultFromServer => {
					this.entitySubject.next(resultFromServer.data);
					var totalCount = resultFromServer.page.TotalCount || (resultFromServer.page.AllPage * resultFromServer.page.Size);
					this.paginatorTotalSubject.next(totalCount);
				}),
				catchError(err => of(new QueryResultsModel([], err))),
				finalize(() => this.loadingSubject.next(false))
			).subscribe(res => {
				this.NienHanService.ReadOnlyControl = res.Visible;
			});
	}
}
