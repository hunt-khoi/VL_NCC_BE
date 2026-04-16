import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { DSHuongBaoHiemService } from '../../Services/danh-sach-huong-bh.service';
import { BaseDataSource, QueryParamsModel, QueryResultsModel } from '../../../../../../../core/_base/crud';

export class DSHuongBaoHiemDataSource extends BaseDataSource {
	constructor(private dsHuongBaoHiemService: DSHuongBaoHiemService) {
		super();
	}

	loadList(queryParams: QueryParamsModel) {
		this.dsHuongBaoHiemService.lastFilter$.next(queryParams);
		this.loadingSubject.next(true);
		this.dsHuongBaoHiemService.findData(queryParams)
			.pipe(
				tap(resultFromServer => {
					this.entitySubject.next(resultFromServer.data);
					var totalCount = resultFromServer.page.TotalCount || (resultFromServer.page.AllPage * resultFromServer.page.Size);
					this.paginatorTotalSubject.next(totalCount);
				}),
				catchError(err => of(new QueryResultsModel([], err))),
				finalize(() => this.loadingSubject.next(false))
			).subscribe(res => {
				this.dsHuongBaoHiemService.ReadOnlyControl = res.Visible;
			});
	}
}
