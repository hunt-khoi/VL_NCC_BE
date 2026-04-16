import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { loaiGiayToServices } from '../../Services/loaigiayto.service';
import { BaseDataSource, QueryParamsModel, QueryResultsModel } from '../../../../../../../core/_base/crud';

export class loaiGiayToDataSource extends BaseDataSource {
    constructor(private loaiGiayToServices: loaiGiayToServices) {
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