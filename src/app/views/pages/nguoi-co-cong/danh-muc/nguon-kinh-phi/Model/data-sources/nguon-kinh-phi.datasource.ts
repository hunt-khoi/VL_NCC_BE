import { NguonKinhPhiService } from './../../Services/nguon-kinh-phi.service';
import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { BaseDataSource, QueryParamsModel, QueryResultsModel } from '../../../../../../../core/_base/crud';

export class NguonKinhPhiDataSource extends BaseDataSource {
	constructor(private NguonKinhPhiService: NguonKinhPhiService) {
		super();
	}

	loadList(queryParams: QueryParamsModel) {
		this.NguonKinhPhiService.lastFilter$.next(queryParams);
		this.loadingSubject.next(true);

		this.NguonKinhPhiService.findData(queryParams)
			.pipe(
				tap(resultFromServer => {
					this.entitySubject.next(resultFromServer.data);
					const totalCount = resultFromServer.page.TotalCount || (resultFromServer.page.AllPage * resultFromServer.page.Size);
					this.paginatorTotalSubject.next(totalCount);
				}),
				catchError(err => of(new QueryResultsModel([], err))),
				finalize(() => this.loadingSubject.next(false))
			).subscribe(res => {
				this.NguonKinhPhiService.ReadOnlyControl = res.Visible;
			});
	}
}
