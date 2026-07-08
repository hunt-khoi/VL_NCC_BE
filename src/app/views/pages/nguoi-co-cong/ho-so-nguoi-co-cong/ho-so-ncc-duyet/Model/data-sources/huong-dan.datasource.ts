import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { BaseDataSource, QueryParamsModel, QueryResultsModel } from '../../../../../../../core/_base/crud';
import { HoSoNCCDuyetService } from '../../Services/ho-so-ncc-duyet.service';

export class HuongDanDataSource extends BaseDataSource {
	constructor(private objectService: HoSoNCCDuyetService) {
		super();
	}

	loadList(queryParams: QueryParamsModel) {
		this.objectService.lastFilterHD$.next(queryParams);
		this.loadingSubject.next(true);
		this.objectService.findDataHD(queryParams)
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
			}
		);
	}
}