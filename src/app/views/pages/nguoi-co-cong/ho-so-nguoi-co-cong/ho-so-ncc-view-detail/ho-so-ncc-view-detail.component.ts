import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, Inject } from '@angular/core';
import { LayoutUtilsService } from '../../../../../core/_base/crud';
import { ActivatedRoute } from '@angular/router';
import { HoSoNCCService } from '../ho-so-ncc/Services/ho-so-ncc.service';
@Component({
	selector: 'kt-ho-so-ncc-view-detail',
	templateUrl: './ho-so-ncc-view-detail.component.html',
	styleUrls: ['./ho-so-ncc-view-detail.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class HoSoNccViewDetailComponent implements OnInit {
	_user: any = {};
	objectId: string;
	constructor(
		private objectService: HoSoNCCService,
		private actRoute: ActivatedRoute,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,) { }

	ngOnInit() {
		this.actRoute.paramMap.subscribe(params => {
			this.objectId = params.get('id');
		});
		if (this.objectId)
			this.objectService.getItem(+this.objectId).subscribe(res => {
				this.changeDetectorRefs.detectChanges();
				if (res && res.status === 1) {
					this._user = res.data;
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
			});
	}

	back() {
		history.back();
	}

}


