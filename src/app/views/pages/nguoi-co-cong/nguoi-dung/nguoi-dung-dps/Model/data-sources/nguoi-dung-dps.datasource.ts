import { BaseDataSource, QueryParamsModel, QueryResultsModel } from 'app/core/_base/crud';
import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { NguoiDungDPSService } from '../../Services/nguoi-dung-dps.service';

export class NguoiDungDPSDataSource extends BaseDataSource {
	constructor(private apiService: NguoiDungDPSService) {
		super();
	}

	loadNguoiDungDPSs(queryParams: QueryParamsModel) {
		this.apiService.lastFilter$.next(queryParams);
        this.loadingSubject.next(true);
		this.apiService.getData(queryParams)
			.pipe(
				tap(res => {
					if (res.data != null && res.data != undefined) {
						this.entitySubject.next(res.data);
						this.paginatorTotalSubject.next(res.page.TotalCount);
					}
					else {
						this.entitySubject.next([]);
						this.paginatorTotalSubject.next(0);
					}
				}),
				catchError(err => of(new QueryResultsModel([], err))),
				finalize(() => this.loadingSubject.next(false))
			).subscribe();
	}
}