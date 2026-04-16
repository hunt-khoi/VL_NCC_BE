import { Component, OnInit, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material';
import { merge, BehaviorSubject } from 'rxjs';
//Service
import { CommonService } from '../../services/common.service';
import { LayoutUtilsService } from '../../../../../core/_base/crud';
import { DomSanitizer } from '@angular/platform-browser';
import { InQuyetDinhService } from './Services/in-quyet-dinh.service';
import { TokenStorage } from '../../../../../core/auth/_services/token-storage.service';

@Component({
	selector: 'kt-in-quyet-dinh',
	templateUrl: './in-quyet-dinh.component.html',
	encapsulation: ViewEncapsulation.None,
})

export class InQuyetDinhComponent implements OnInit {
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	viewLoading: boolean = false;
	isZoomSize: boolean = false;
	disabledBtn: boolean = false;

	Capcocau: number;
	IdDotTangQua: number = 0;
	lstDot: any[] = [];

	idHuyen: number = 0;
	idLoaiMau: number = 0;
	listHuyen: any[] = [];
	strHtml: any;
	
	constructor(
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private translate: TranslateService,
		private changeDetect: ChangeDetectorRef,
		private layoutUtilsService: LayoutUtilsService,
		private service: InQuyetDinhService,
		private commonService: CommonService,
		private sanitized: DomSanitizer,
		private tokenStorage: TokenStorage) { }
		
	transform(value) {
		return this.sanitized.bypassSecurityTrustHtml(value);
	}

	/** LOAD DATA */
	ngOnInit() {
		this.tokenStorage.getUserInfo().subscribe(res => {
			this.Capcocau = res.Capcocau;
			if (res.Capcocau == 2) {
				this.idHuyen = +res.ID_Goc_Cha;
			}
			this.commonService.GetListDistrictByProvinces(res.IdTinh).subscribe(res => {
				this.listHuyen = res.data;
				this.changeDetect.detectChanges();
			})
		})
		this.commonService.liteDotQua(true).subscribe(res => {
			if (res && res.status == 1)
				this.lstDot = res.data;
		})
	}

	view() {
		if (this.IdDotTangQua <= 0) {
			this.layoutUtilsService.showError("Vui lòng chọn đợt tặng quà");
			return;
		}
		if (this.idHuyen <= 0) {
			this.layoutUtilsService.showError("Vui lòng chọn huyện");
			return;
		}
		if (this.idLoaiMau <= 0) {
			this.layoutUtilsService.showError("Vui lòng chọn loại mẫu in");
			return;
		}
		this.strHtml = "";
		this.loadingSubject.next(true);
		this.service.getItem(this.IdDotTangQua, this.idHuyen, this.idLoaiMau).subscribe(res => {
			this.loadingSubject.next(false);
			if (res && res.status == 1) {
				this.strHtml = this.sanitized.bypassSecurityTrustHtml(res.data);
				this.changeDetect.detectChanges();
			} else
				this.layoutUtilsService.showError(res.error.message);
		})
	}

	in(loai) {
		if (this.idLoaiMau <= 0) {
			this.layoutUtilsService.showError("Vui lòng chọn loại mẫu in");
			return;
		}
		this.loadingSubject.next(true);
		this.service.export(this.IdDotTangQua, this.idHuyen, loai, this.idLoaiMau).subscribe(response => {
			this.loadingSubject.next(false);
			const headers = response.headers;
			const filename = headers.get('x-filename');
			const type = headers.get('content-type');
			const blob = new Blob([response.body], { type });
			const fileURL = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = fileURL;
			link.download = filename;
			link.click();
		}, err => {
			this.layoutUtilsService.showError("Xuất quyết định thất bại");
		});
	}
}
