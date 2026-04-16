import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { BaseDataSource, QueryParamsModel, QueryResultsModel } from '../../../../../../../core/_base/crud';
import { NhapBaoHiemDuyetService } from '../../Services/nhap-bao-hiem-duyet.service';

export class NhapBaoHiemDuyetDataSource extends BaseDataSource {
	constructor(private NhapBaoHiemDuyetService: NhapBaoHiemDuyetService) {
		super();
	}

	loadList(queryParams: QueryParamsModel, cap: number = 3) {
		this.NhapBaoHiemDuyetService.lastFilter$.next(queryParams);
		this.loadingSubject.next(true);
		this.NhapBaoHiemDuyetService.findData(queryParams, cap)
			.pipe(
				tap(resultFromServer => {
					this.entitySubject.next(resultFromServer.data);
					var totalCount = resultFromServer.page.TotalCount || (resultFromServer.page.AllPage * resultFromServer.page.Size);
					this.paginatorTotalSubject.next(totalCount);
				}),
				catchError(err => of(new QueryResultsModel([], err))),
				finalize(() => this.loadingSubject.next(false))
			).subscribe(res => {
				this.NhapBaoHiemDuyetService.ReadOnlyControl = res.Visible;
			});
	}
}
