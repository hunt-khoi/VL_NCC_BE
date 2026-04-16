import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { BaseDataSource, QueryParamsModel, QueryResultsModel } from '../../../../../../../core/_base/crud';
import { NoiDungChiService } from '../../services/noi-dung-chi.service';

export class NoDungChiDataSource extends BaseDataSource {
	constructor(private noiDungChiServices: NoiDungChiService) {
		super();
	}

	loadList(queryParams: QueryParamsModel) {
		this.noiDungChiServices.lastFilter$.next(queryParams);
		this.loadingSubject.next(true);

		this.noiDungChiServices.findData(queryParams)
			.pipe(
				tap(resultFromServer => {
					this.entitySubject.next(resultFromServer.data);
					var totalCount = resultFromServer.page.TotalCount || (resultFromServer.page.AllPage * resultFromServer.page.Size);
					this.paginatorTotalSubject.next(totalCount);
				}),
				catchError(err => of(new QueryResultsModel([], err))),
				finalize(() => this.loadingSubject.next(false))
			).subscribe(res => {
				this.noiDungChiServices.ReadOnlyControl = res.Visible;
			});
	}
}
