import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { BaseDataSource, QueryParamsModel, QueryResultsModel } from 'app/core/_base/crud';
import { EmailHistoryService } from '../../Services/email-history.service';

export class EmailHistoryDataSource extends BaseDataSource {
	constructor(private productsService: EmailHistoryService) {
		super();
	}

	loadEmailHistorys(queryParams: QueryParamsModel) {
		this.productsService.lastFilter$.next(queryParams);
        this.loadingSubject.next(true);
		this.productsService.getData(queryParams)
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