import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { loaisolieuService } from '../../Services/loaisolieu.service';
import { BaseDataSource, QueryParamsModel, QueryResultsModel } from '../../../../../../../core/_base/crud';

export class loaisolieuDataSource extends BaseDataSource {
	constructor(private loaisolieuService: loaisolieuService) {
		super();
	}

	loadList(queryParams: QueryParamsModel) {
		this.loaisolieuService.lastFilter$.next(queryParams);
		this.loadingSubject.next(true);
		this.loaisolieuService.findData(queryParams)
			.pipe(
				tap(resultFromServer => {
					this.entitySubject.next(resultFromServer.data);
					var totalCount = resultFromServer.page.TotalCount || (resultFromServer.page.AllPage * resultFromServer.page.Size);
					this.paginatorTotalSubject.next(totalCount);
				}),
				catchError(err => of(new QueryResultsModel([], err))),
				finalize(() => this.loadingSubject.next(false))
			).subscribe(res => {
				this.loaisolieuService.ReadOnlyControl = res.Visible;
			});
	}
}
