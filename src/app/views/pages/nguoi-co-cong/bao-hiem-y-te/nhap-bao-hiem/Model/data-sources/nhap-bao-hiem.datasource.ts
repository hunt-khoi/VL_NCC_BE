import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { NhapBaoHiemService } from '../../Services/nhap-bao-hiem.service';
import { BaseDataSource, QueryParamsModel, QueryResultsModel } from '../../../../../../../core/_base/crud';

export class NhapBaoHiemDataSource extends BaseDataSource {
	constructor(private NhapBaoHiemService: NhapBaoHiemService) {
		super();
	}

	loadList(queryParams: QueryParamsModel) {
		this.NhapBaoHiemService.lastFilter$.next(queryParams);
		this.loadingSubject.next(true);
		this.NhapBaoHiemService.findData(queryParams)
			.pipe(
				tap(resultFromServer => {
					this.entitySubject.next(resultFromServer.data);
					var totalCount = resultFromServer.page.TotalCount || (resultFromServer.page.AllPage * resultFromServer.page.Size);
					this.paginatorTotalSubject.next(totalCount);
				}),
				catchError(err => of(new QueryResultsModel([], err))),
				finalize(() => this.loadingSubject.next(false))
			).subscribe(res => {
				this.NhapBaoHiemService.ReadOnlyControl = res.Visible;
			});
	}
}
