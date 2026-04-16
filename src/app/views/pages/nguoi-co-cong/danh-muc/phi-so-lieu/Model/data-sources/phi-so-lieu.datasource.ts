import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { BaseDataSource, QueryParamsModel, QueryResultsModel } from '../../../../../../../core/_base/crud';
import { PhiSoLieuServices } from '../../Services/phi-so-lieu.service';

export class loaiGiayToDataSource extends BaseDataSource {
    constructor(private loaiGiayToServices: PhiSoLieuServices) {
		super();
    }
    
    loadList(queryParams: QueryParamsModel) {
		this.loaiGiayToServices.lastFilter$.next(queryParams);
		this.loadingSubject.next(true);

		this.loaiGiayToServices.findData(queryParams)
			.pipe(
				tap(resultFromServer => {
					this.entitySubject.next(resultFromServer.data);
				var totalCount = resultFromServer.page.TotalCount || (resultFromServer.page.AllPage * resultFromServer.page.Size);
					this.paginatorTotalSubject.next(totalCount);
				}),
				catchError(err => of(new QueryResultsModel([], err))),
				finalize(() => this.loadingSubject.next(false))
			).subscribe(res => {
				this.loaiGiayToServices.ReadOnlyControl = res.Visible;
			});
	}
}