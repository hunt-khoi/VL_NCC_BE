import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { BaseDataSource, QueryParamsModel, QueryResultsModel } from 'app/core/_base/crud';
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
			).subscribe(res => {
				this.service.ReadOnlyControl = res.Visible;
			}
		);
	}
}