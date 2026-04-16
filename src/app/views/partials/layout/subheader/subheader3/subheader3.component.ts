import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { SubheaderService } from '../../../../../core/_base/layout';
import { Breadcrumb } from '../../../../../core/_base/layout/services/subheader.service';

@Component({
	selector: 'kt-subheader3',
	templateUrl: './subheader3.component.html',
	styleUrls: ['./subheader3.component.scss']
})
export class Subheader3Component implements OnInit, OnDestroy, AfterViewInit {
	// Public properties
	@Input() fluid: boolean = false;
	@Input() clear: boolean = false;
	today: number = Date.now();
	title: string = "";
	desc: string = "";
	breadcrumbs: Breadcrumb[] = [];

	private subscriptions: Subscription[] = [];

	constructor(public subheaderService: SubheaderService) { }

	ngOnInit() { }

	ngAfterViewInit(): void {
		this.subscriptions.push(this.subheaderService.title$.subscribe(bt => {
			// breadcrumbs title sometimes can be undefined
			if (bt) {
				Promise.resolve(null).then(() => {
					this.title = bt.title;
					this.desc = bt.desc + "";
				});
			}
		}));

		this.subscriptions.push(this.subheaderService.breadcrumbs$.subscribe(bc => {
			Promise.resolve(null).then(() => {
				this.breadcrumbs = bc;
			});
		}));
	}

	ngOnDestroy(): void {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}
}