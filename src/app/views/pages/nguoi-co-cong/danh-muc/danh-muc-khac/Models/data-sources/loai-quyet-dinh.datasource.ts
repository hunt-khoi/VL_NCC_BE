import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { BaseDataSource, QueryParamsModel, QueryResultsModel } from '../../../../../../../core/_base/crud';
import { LoaiQuyetDinhService } from '../../services/loai-quyet-dinh.service';

export class LoaiQuyetDinhDataSource extends BaseDataSource {
	constructor(private danhmuckhacServices: LoaiQuyetDinhService) {
		super();
	}

	loadList(queryParams: QueryParamsModel) {
		this.danhmuckhacServices.lastFilter$.next(queryParams);
		this.loadingSubject.next(true);

		this.danhmuckhacServices.findData(queryParams)
			.pipe(
				tap(resultFromServer => {
					this.entitySubject.next(resultFromServer.data);
					var totalCount = resultFromServer.page.TotalCount || (resultFromServer.page.AllPage * resultFromServer.page.Size);
					this.paginatorTotalSubject.next(totalCount);
				}),
				catchError(err => of(new QueryResultsModel([], err))),
				finalize(() => this.loadingSubject.next(false))
			).subscribe(res => {
				this.danhmuckhacServices.ReadOnlyControl = res.Visible;
			});
	}
}
