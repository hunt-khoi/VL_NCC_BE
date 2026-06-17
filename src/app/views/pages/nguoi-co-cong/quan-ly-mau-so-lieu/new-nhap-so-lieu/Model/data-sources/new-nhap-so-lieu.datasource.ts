import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { BaseDataSource, QueryParamsModel, QueryResultsModel } from '../../../../../../../core/_base/crud';
import { NhapSoLieuService } from '../../../nhap-so-lieu/Services/nhap-so-lieu.service';

export class NhapSoLieuDataSource extends BaseDataSource {
	constructor(private objectService: NhapSoLieuService) {
		super();
	}

	loadList(queryParams: QueryParamsModel) {
		this.objectService.lastFilter$.next(queryParams);
		this.loadingSubject.next(true);
		this.objectService.findListMauNhapSoLieuData(queryParams)
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