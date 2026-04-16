import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../../services/common.service';
import { TokenStorage } from '../../../../../../core/auth/_services/token-storage.service';

@Component({
	selector: 'm-quan-ly-quy-tab',
	templateUrl: './quan-ly-quy-tab.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class QuanLyQuyTabComponent implements OnInit {

	productsResult: any[] = [];
	_name = "";
	UserInfo: any;
	list_button: boolean;
	selectedTab: number = 0;

	constructor(
		public CommonService: CommonService,
		private tokenStorage: TokenStorage,
		private changeDetectorRefs: ChangeDetectorRef,
		private translate: TranslateService) {
	}

	/** LOAD DATA */
	ngOnInit() {
		this.list_button = CommonService.list_button();
		this.tokenStorage.getUserInfo().subscribe(res => {
			this.UserInfo = res;
		})
	}

	getHeight(): any {
		let obj = window.location.href.split("/").find(x => x == "tabs-references");
		if (obj) {
			let tmp_height = 0;
			tmp_height = window.innerHeight - 354;
			return tmp_height + 'px';
		} else {
			let tmp_height = 0;
			tmp_height = window.innerHeight - 236;
			return tmp_height + 'px';
		}
	}
}
