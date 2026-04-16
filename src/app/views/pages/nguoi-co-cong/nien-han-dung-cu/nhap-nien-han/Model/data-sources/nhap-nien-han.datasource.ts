import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { NhapNienHanService } from '../../Services/nhap-nien-han.service';
import { BaseDataSource, QueryParamsModel, QueryResultsModel } from '../../../../../../../core/_base/crud';

export class NhapNienHanDataSource extends BaseDataSource {
	constructor(private NienHanService: NhapNienHanService) {
		super();
	}

	loadList(queryParams: QueryParamsModel) {
		this.NienHanService.lastFilter$.next(queryParams);
		this.loadingSubject.next(true);
		this.NienHanService.findData(queryParams)
			.pipe(
				tap(resultFromServer => {
					this.entitySubject.next(resultFromServer.data);
					var totalCount = resultFromServer.page.TotalCount || (resultFromServer.page.AllPage * resultFromServer.page.Size);
					this.paginatorTotalSubject.next(totalCount);
				}),
				catchError(err => of(new QueryResultsModel([], err))),
				finalize(() => this.loadingSubject.next(false))
			).subscribe(res => {
				this.NienHanService.ReadOnlyControl = res.Visible;
			});
	}
}
