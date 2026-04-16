import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { loaiDieuDuongServices } from '../../Services/loaidieuduong.service';
import { BaseDataSource, QueryParamsModel, QueryResultsModel } from '../../../../../../../core/_base/crud';

export class loaiDieuDuongDataSource extends BaseDataSource {
    constructor(private loaiDieuDuongServices: loaiDieuDuongServices) {
		super();
    }
    
    loadList(queryParams: QueryParamsModel) {
		this.loaiDieuDuongServices.lastFilter$.next(queryParams);
		this.loadingSubject.next(true);

		this.loaiDieuDuongServices.findData(queryParams)
			.pipe(
				tap(resultFromServer => {
					this.entitySubject.next(resultFromServer.data);
				var totalCount = resultFromServer.page.TotalCount || (resultFromServer.page.AllPage * resultFromServer.page.Size);
					this.paginatorTotalSubject.next(totalCount);
				}),
				catchError(err => of(new QueryResultsModel([], err))),
				finalize(() => this.loadingSubject.next(false))
			).subscribe(res => {
				this.loaiDieuDuongServices.ReadOnlyControl = res.Visible;
			});
	}
}