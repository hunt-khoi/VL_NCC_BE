import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { BaseDataSource, QueryParamsModel, QueryResultsModel } from 'app/core/_base/crud';
import { CommonService } from '../../services/common.service';

export class ChonVaiTroDataSource extends BaseDataSource {
	constructor(private service: CommonService) {
		super();
	}

	LoadData(queryParams: QueryParamsModel) {
		this.loadingSubject.next(true);
		this.service.ListVaiTroPhanTrang(queryParams)
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