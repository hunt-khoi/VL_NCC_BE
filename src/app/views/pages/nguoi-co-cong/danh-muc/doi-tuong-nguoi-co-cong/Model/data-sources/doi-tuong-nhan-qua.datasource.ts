import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { BaseDataSource, QueryParamsModel, QueryResultsModel } from '../../../../../../../core/_base/crud';
import { DoiTuongNguoiCoCongService } from './../../Services/doi-tuong-nguoi-co-cong.service';

export class DoiTuongNhanQuaDataSource extends BaseDataSource {
	constructor(private apiService: DoiTuongNguoiCoCongService) {
		super();
	}

	loadList(queryParams: QueryParamsModel) {
		this.apiService.lastFilterNQ$.next(queryParams);
		this.loadingSubject.next(true);
		this.apiService.findDataNhanQua(queryParams)
			.pipe(
				tap(res => {
					this.entitySubject.next(res.data);
					const totalCount = res.page.TotalCount || (res.page.AllPage * res.page.Size);
					this.paginatorTotalSubject.next(totalCount);
				}),
				catchError(err => of(new QueryResultsModel([], err))),
				finalize(() => this.loadingSubject.next(false))
			).subscribe(res => {
				this.apiService.ReadOnlyControl = res.Visible;
			}
		);
	}
}