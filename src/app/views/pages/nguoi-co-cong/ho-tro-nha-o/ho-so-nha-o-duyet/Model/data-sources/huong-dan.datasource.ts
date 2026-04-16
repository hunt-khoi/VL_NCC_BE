import { HoSoNhaODuyetService } from '../../Services/ho-so-nha-o-duyet.service';
import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { BaseDataSource, QueryParamsModel, QueryResultsModel } from '../../../../../../../core/_base/crud';

export class HuongDanNhaODataSource extends BaseDataSource {
	constructor(private objectService: HoSoNhaODuyetService) {
		super();
	}

	loadList(queryParams: QueryParamsModel) {
		this.objectService.lastFilterHD$.next(queryParams);
		this.loadingSubject.next(true);

		this.objectService.findDataHD(queryParams)
			.pipe(
				tap(resultFromServer => {
					this.entitySubject.next(resultFromServer.data);
					const totalCount = resultFromServer.page.TotalCount || (resultFromServer.page.AllPage * resultFromServer.page.Size);
					this.paginatorTotalSubject.next(totalCount);
				}),
				catchError(err => of(new QueryResultsModel([], err))),
				finalize(() => this.loadingSubject.next(false))
			).subscribe(res => {
				this.objectService.ReadOnlyControl = res.Visible;
			});
	}
}
