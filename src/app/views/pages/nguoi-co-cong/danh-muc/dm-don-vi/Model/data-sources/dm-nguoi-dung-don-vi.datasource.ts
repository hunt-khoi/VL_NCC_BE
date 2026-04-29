import { BaseDataSource, QueryParamsModel, QueryResultsModel } from 'app/core/_base/crud';
import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { DM_DonViService } from '../../Services/dm-don-vi.service';
import { DM_User_DonViModel } from '../dm-don-vi.model';

export class DM_NguoiDungDonViDataSource extends BaseDataSource {
	constructor(private apiService: DM_DonViService) {
		super();
	}

	loadDM_User_DonVis(queryParams: QueryParamsModel, HasLoaiXL: boolean = false) {
		this.apiService.lastFilter$.next(queryParams);
        this.loadingSubject.next(true);
		this.apiService.getData_User(queryParams)
			.pipe(
				tap(res => {
					if (res.status ==1) {
						if (res.data) {
							if (HasLoaiXL){
								let tmpdm_donvisResult: any[] = [];
								res.data.forEach(el => {
									let element = new DM_User_DonViModel();
									element.copy(el);
									tmpdm_donvisResult.push(element);
								});
								this.entitySubject.next(tmpdm_donvisResult);
							} else {
								this.entitySubject.next(res.data);
							}
						} else {
							this.entitySubject.next([]);
						}
						if (res.page != null) {
							var totalCount = res.page.TotalCount || (res.page.AllPage * res.page.Size);
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