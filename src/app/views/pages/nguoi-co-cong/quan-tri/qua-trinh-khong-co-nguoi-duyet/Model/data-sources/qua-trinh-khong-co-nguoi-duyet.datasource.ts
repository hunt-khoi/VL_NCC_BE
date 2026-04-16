import { BaseDataSource, QueryParamsModel, QueryResultsModel } from 'app/core/_base/crud';
import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { QuaTrinhKhongCoNguoiDuyetService } from '../../Services/qua-trinh-khong-co-nguoi-duyet.service';

export class QuaTrinhKhongCoNguoiDuyetDataSource extends BaseDataSource {
	constructor(private service: QuaTrinhKhongCoNguoiDuyetService) {
		super();
	}

	loadData(queryParams: QueryParamsModel) {
		this.service.lastFilter$.next(queryParams);
		this.loadingSubject.next(true);
		this.service.getData(queryParams)
			.pipe(
				tap(resultFromServer => {
					if (resultFromServer.data != null && resultFromServer.data != undefined) {
						this.entitySubject.next(resultFromServer.data);
						this.paginatorTotalSubject.next(resultFromServer.page.TotalCount);
					}
					else {
						this.entitySubject.next(null);
						this.paginatorTotalSubject.next(null);
					}
				}),
				catchError(err => of(new QueryResultsModel([], err))),
				finalize(() => this.loadingSubject.next(false))
			).subscribe(res => {
				this.service.ReadOnlyControl = res.Visible;
			});
	}
}
