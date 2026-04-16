import { MucQuaService } from '../../Services/muc-qua.service';
import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { BaseDataSource, QueryParamsModel, QueryResultsModel } from '../../../../../../../core/_base/crud';

export class MucQuaDataSource extends BaseDataSource {
	constructor(private dienChinhHinhService: MucQuaService) {
		super();
	}

	loadList(queryParams: QueryParamsModel) {
		this.dienChinhHinhService.lastFilter$.next(queryParams);
		this.loadingSubject.next(true);

		this.dienChinhHinhService.findData(queryParams)
			.pipe(
				tap(resultFromServer => {
					this.entitySubject.next(resultFromServer.data);
					const totalCount = resultFromServer.page.TotalCount || (resultFromServer.page.AllPage * resultFromServer.page.Size);
					this.paginatorTotalSubject.next(totalCount);
				}),
				catchError(err => of(new QueryResultsModel([], err))),
				finalize(() => this.loadingSubject.next(false))
			).subscribe(res => {
				this.dienChinhHinhService.ReadOnlyControl = res.Visible;
			});
	}
}
