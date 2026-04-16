import { Component, OnInit, Injectable, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { DM_DonViService } from './Services/dm-don-vi.service';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { QueryParamsModel } from 'app/core/_base/crud';

@Component({
	selector: 'kt-dm-don-vi',
	templateUrl: './dm-don-vi.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
@Injectable()
export class DM_DonViComponent implements OnInit {
	donvi: string = "";
	donvi_user: string = "";
	dataTreeDonVi: any[] = [];
	loading$: Observable<boolean>;
	constructor(
		private dMDonViService: DM_DonViService,
		private changeDetect: ChangeDetectorRef,
	) { }

	ngOnInit() {
		if (this.dMDonViService != undefined)
			this.dMDonViService.lastFilter$ = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));
		this.GetTreeDonVi();
	}
	GetTreeDonVi() {
		this.loading$ = of(true);
		this.dataTreeDonVi = [];
		this.dMDonViService.GetTreeDonVi().subscribe(res => {
			this.loading$ = of(false);
			// res.data.anCss= {
			// 	collapse: true,
			// 	lastChild: false,
			// 	state: 0,//trạng thái luôn luôn mở node này, 0 -> open, -1 -> close
			// 	checked: false,
			// 	parentChk: ''
			// }
			let tree = [];
			if (res.data) {
				let i = 0;
				res.data.forEach(element => {
					let item = element;
					if (i == 0) {
						item.anCss = {
							collapse: true,
							lastChild: false,
							state: 0,//trạng thái luôn luôn mở node này, 0 -> open, -1 -> close
							checked: false,
							parentChk: '',
							active: true
						}
					}
					else {
						item.anCss = {
							collapse: true,
							lastChild: false,
							state: 0,//trạng thái luôn luôn mở node này, 0 -> open, -1 -> close
							checked: false,
							parentChk: '',

						}
					}

					tree.push(item);
					i++;
				});
			}
			this.dataTreeDonVi = tree;
			this.changeDetect.detectChanges();
		});
	}
	treeDonViChanged(item) {
		if (item) {
			this.donvi = item.data.IdGroup;
			this.donvi_user = item.data.IdGroup;
		}
	}
	ChangeListUser(item) {
		this.donvi_user = item.Id;
	}
}
