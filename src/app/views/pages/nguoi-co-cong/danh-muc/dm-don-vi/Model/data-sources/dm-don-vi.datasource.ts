import { BaseDataSource, QueryParamsModel, QueryResultsModel } from 'app/core/_base/crud';
import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { DM_DonViService } from '../../Services/dm-don-vi.service';
import { DM_DonViModel } from '../dm-don-vi.model';

export class DM_DonViDataSource extends BaseDataSource {
	constructor(private productsService: DM_DonViService) {
		super();
	}

	loadDM_DonVis(queryParams: QueryParamsModel, HasLoaiXL:boolean=false) {
		this.productsService.lastFilter$.next(queryParams);
        this.loadingSubject.next(true);
		this.productsService.getData(queryParams)
			.pipe(
				tap(resultFromServer => {
					if (resultFromServer.status == 1) {
						if (resultFromServer.data) {
							if (HasLoaiXL) {
								let tmpdm_donvisResult = [];
								resultFromServer.data.forEach(el=>{
									let tmpElement = new DM_DonViModel();
										tmpElement.copy(el)
										tmpdm_donvisResult.push(tmpElement);
								});
								this.entitySubject.next(tmpdm_donvisResult);
							} else {
								this.entitySubject.next(resultFromServer.data);
							}
							
						} else {
							this.entitySubject.next([]);
						}
						if (resultFromServer.page != null) {
							var totalCount = resultFromServer.page.TotalCount || (resultFromServer.page.AllPage * resultFromServer.page.Size);
							this.paginatorTotalSubject.next(totalCount);
						} else {
							this.paginatorTotalSubject.next(0);
						}
					} else {
						this.entitySubject.next([]);
						this.paginatorTotalSubject.next(0);
					}	
				}),
				catchError(err => of(new QueryResultsModel([], err))),
				finalize(() => this.loadingSubject.next(false))
			).subscribe();
	}

	loadDM_User_DonVis(queryParams: QueryParamsModel) {
		this.productsService.lastFilter$.next(queryParams);
        this.loadingSubject.next(true);
		this.productsService.getData_User(queryParams)
			.pipe(
				tap(resultFromServer => {
					if (resultFromServer.status == 1) {
						if (resultFromServer.data) {
							this.entitySubject.next(resultFromServer.data);
						} else {
							this.entitySubject.next([]);
						}
						if (resultFromServer.page != null) {
							var totalCount = resultFromServer.page.TotalCount || (resultFromServer.page.AllPage * resultFromServer.page.Size);
							this.paginatorTotalSubject.next(totalCount);
						} else {
							this.paginatorTotalSubject.next(0);
						}
					} else {
						this.entitySubject.next([]);
						this.paginatorTotalSubject.next(0);
					}	
				}),
				catchError(err => of(new QueryResultsModel([], err))),
				finalize(() => this.loadingSubject.next(false))
			).subscribe();
	}
}
