import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { dtHoTroServices } from '../../Services/dt-ho-tro-quy.service';
import { BaseDataSource, QueryParamsModel, QueryResultsModel } from '../../../../../../../core/_base/crud';

export class dtHoTroDataSource extends BaseDataSource {
    constructor(private dtHoTroServices: dtHoTroServices) {
		super();
    }
    
    loadList(queryParams: QueryParamsModel) {
		this.dtHoTroServices.lastFilter$.next(queryParams);
		this.loadingSubject.next(true);

		this.dtHoTroServices.findData(queryParams)
			.pipe(
				tap(resultFromServer => {
					this.entitySubject.next(resultFromServer.data);
				var totalCount = resultFromServer.page.TotalCount || (resultFromServer.page.AllPage * resultFromServer.page.Size);
					this.paginatorTotalSubject.next(totalCount);
				}),
				catchError(err => of(new QueryResultsModel([], err))),
				finalize(() => this.loadingSubject.next(false))
			).subscribe(res => {
				this.dtHoTroServices.ReadOnlyControl = res.Visible;
			});
	}
}