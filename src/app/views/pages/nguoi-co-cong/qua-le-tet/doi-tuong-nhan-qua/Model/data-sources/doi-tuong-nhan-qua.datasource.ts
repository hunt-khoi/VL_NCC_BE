import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { BaseDataSource, QueryParamsModel, QueryResultsModel } from '../../../../../../../core/_base/crud';
import { DoiTuongNhanQuaService } from '../../Services/doi-tuong-nhan-qua.service';

export class DoiTuongNhanQuaDataSource extends BaseDataSource {
	constructor(private objectService: DoiTuongNhanQuaService) {
		super();
	}

	loadList(queryParams: QueryParamsModel) {
		this.objectService.lastFilter$.next(queryParams);
		this.loadingSubject.next(true);
		this.objectService.findData(queryParams)
			.pipe(
				tap(res => {
					this.entitySubject.next(res.data);
					const totalCount = res.page.TotalCount || (res.page.AllPage * res.page.Size);
					this.paginatorTotalSubject.next(totalCount);
				}),
				catchError(err => of(new QueryResultsModel([], err))),
				finalize(() => this.loadingSubject.next(false))
			).subscribe(res => {
				this.objectService.ReadOnlyControl = res.Visible;
			});
	}
}