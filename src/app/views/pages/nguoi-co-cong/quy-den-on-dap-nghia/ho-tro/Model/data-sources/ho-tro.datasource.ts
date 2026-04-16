import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { HoTroService } from '../../Services/ho-tro.service';
import { BaseDataSource, QueryParamsModel, QueryResultsModel } from '../../../../../../../core/_base/crud';

export class HoTroDataSource extends BaseDataSource {
	constructor(private HoTroService: HoTroService) {
		super();
	}

	loadList(queryParams: QueryParamsModel) {
		this.HoTroService.lastFilter$.next(queryParams);
		this.loadingSubject.next(true);
		this.HoTroService.findData(queryParams)
			.pipe(
				tap(resultFromServer => {
					this.entitySubject.next(resultFromServer.data);
					var totalCount = resultFromServer.page.TotalCount || (resultFromServer.page.AllPage * resultFromServer.page.Size);
					this.paginatorTotalSubject.next(totalCount);
				}),
				catchError(err => of(new QueryResultsModel([], err))),
				finalize(() => this.loadingSubject.next(false))
			).subscribe(res => {
				this.HoTroService.ReadOnlyControl = res.Visible;
			});
	}
}
