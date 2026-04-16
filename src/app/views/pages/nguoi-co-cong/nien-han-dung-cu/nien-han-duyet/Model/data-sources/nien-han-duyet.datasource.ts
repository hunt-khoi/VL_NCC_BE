import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { BaseDataSource, QueryParamsModel, QueryResultsModel } from '../../../../../../../core/_base/crud';
import { NienHanDuyetService } from '../../Services/nien-han-duyet.service';

export class NienHanDuyetDataSource extends BaseDataSource {
	constructor(private NienHanService: NienHanDuyetService) {
		super();
	}

	loadList(queryParams: QueryParamsModel, isth: boolean = false, isxa: boolean = false) {
		this.NienHanService.lastFilter$.next(queryParams);
		this.loadingSubject.next(true);
		this.NienHanService.findData(queryParams, isth, isxa)
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
