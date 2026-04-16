import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { HolidaysService } from '../../Services/ngay-le.service';
import { BaseDataSource, QueryParamsModel, QueryResultsModel } from '../../../../../../../core/_base/crud';

export class HolidaysDataSource extends BaseDataSource {
	constructor(private HolidaysService: HolidaysService) {
		super();
	}

	loadList(queryParams: QueryParamsModel) {
		this.HolidaysService.lastFilter$.next(queryParams);
		this.loadingSubject.next(true);

		this.HolidaysService.findData(queryParams)
			.pipe(
				tap(resultFromServer => {
					this.entitySubject.next(resultFromServer.data);
				var totalCount = resultFromServer.page.TotalCount || (resultFromServer.page.AllPage * resultFromServer.page.Size);
					this.paginatorTotalSubject.next(totalCount);
				}),
				catchError(err => of(new QueryResultsModel([], err))),
				finalize(() => this.loadingSubject.next(false))
			).subscribe(res => {
				this.HolidaysService.ReadOnlyControl = res.Visible;
			});
	}
}
