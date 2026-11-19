import { Component, OnInit, ViewEncapsulation, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from '../../nguoi-co-cong/services/common.service';

@Component({
    selector: 'kt-overview',
    templateUrl: './overview.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class OverviewComponent implements OnInit {
	user$: Observable<any> | undefined;

	constructor(
		private commonService: CommonService,
		private changeDetect: ChangeDetectorRef, ) {
	}

	ngOnInit(): void {
		this.commonService.GetInfoUser().subscribe(res => {
			this.user$ = new Observable((observer) => {
				// observable execution
				observer.next(res.data);
				observer.complete();
				this.changeDetect.detectChanges();
			})
		})
	}
}