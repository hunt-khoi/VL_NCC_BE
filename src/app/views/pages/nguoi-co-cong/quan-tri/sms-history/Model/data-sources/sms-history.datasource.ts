import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { BaseDataSource, QueryParamsModel, QueryResultsModel } from 'app/core/_base/crud';
import { SMSHistoryService } from '../../Services/sms-history.service';

export class SMSHistoryDataSource extends BaseDataSource {
	constructor(private apiService: SMSHistoryService) {
		super();
	}

	loadSMSHistorys(queryParams: QueryParamsModel) {
		this.apiService.lastFilter$.next(queryParams);
        this.loadingSubject.next(true);
		this.apiService.getData(queryParams)
			.pipe(
				tap(res => {
					if(res && res.status ==1){
						this.entitySubject.next(res.data);
						this.paginatorTotalSubject.next(res.page.TotalCount);
					}else{
						this.entitySubject.next([]);
						this.paginatorTotalSubject.next(0);
					}	
				}),
				catchError(err => of(new QueryResultsModel([], err))),
				finalize(() => this.loadingSubject.next(false))
			).subscribe();
	}
}