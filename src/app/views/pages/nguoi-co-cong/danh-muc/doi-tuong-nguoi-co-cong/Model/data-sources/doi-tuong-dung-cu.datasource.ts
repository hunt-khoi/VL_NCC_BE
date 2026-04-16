import { DoiTuongNguoiCoCongService } from '../../Services/doi-tuong-nguoi-co-cong.service';
import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { BaseDataSource, QueryParamsModel, QueryResultsModel } from '../../../../../../../core/_base/crud';

export class DoiTuongDungCuChinhHinhDataSource extends BaseDataSource {
	constructor(private doiTuongNguoiCoCongService: DoiTuongNguoiCoCongService) {
		super();
	}

	loadList(queryParams: QueryParamsModel) {
		this.doiTuongNguoiCoCongService.lastFilter$.next(queryParams);
		this.loadingSubject.next(true);

		this.doiTuongNguoiCoCongService.findDataDoiTuongDCCH(queryParams)
			.pipe(
				tap(resultFromServer => {
					this.entitySubject.next(resultFromServer.data);
					const totalCount = resultFromServer.page.TotalCount || (resultFromServer.page.AllPage * resultFromServer.page.Size);
					this.paginatorTotalSubject.next(totalCount);
				}),
				catchError(err => of(new QueryResultsModel([], err))),
				finalize(() => this.loadingSubject.next(false))
			).subscribe(res => {
				this.doiTuongNguoiCoCongService.ReadOnlyControl = res.Visible;
			});
	}
}
