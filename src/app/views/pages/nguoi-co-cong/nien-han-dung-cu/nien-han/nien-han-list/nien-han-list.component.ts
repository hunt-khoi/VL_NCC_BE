import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';
import { TokenStorage } from '../../../../../../core/auth/_services/token-storage.service';
import { MatDialog } from '@angular/material';
import { ReviewExportComponent } from '../../../components';
import { CommonService } from '../../../services/common.service';
import { NienHanService } from '../Services/nien-han.service';

@Component({
	selector: 'kt-nien-han-list',
	templateUrl: './nien-han-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class NienHanListComponent implements OnInit {
	donvi: any;
	dataTreeDonVi: any[] = [];
	lstDotNienHan: any[] = [];
	CapCoCau: number;
	idParent: number;
	dot: number = 0;
	nam: number;
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	selectedTab: number = 1;
	range: number = 0;

	constructor(
		private changeDetect: ChangeDetectorRef,
		private commonService: CommonService,
		private tokenStorage: TokenStorage,
		private NienHanService1: NienHanService,
		public dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService) { }

	ngOnInit() {
		this.tokenStorage.getUserInfo().subscribe(res => {
			this.CapCoCau = res.Capcocau;
			this.idParent = res.ID_Goc;
			if (this.idParent == 0)
				this.idParent = res.ID_Goc_Cha;
			if (this.CapCoCau == 2) 
				this.getRange();
		})
		this.GetTreeDonVi();
		this.changeNam();
	}

	changeNam() {
		this.dot = 0;
		this.commonService.liteDotNienHan(true, this.nam).subscribe(res => {
			if (res && res.status == 1)
				this.lstDotNienHan = res.data;
		})
	}

	getRange() {
		this.NienHanService1.getRange().subscribe(res => {
			if (res && res.status == 1) {
				this.range = res.data;
			}
		})
	}

	GetTreeDonVi() {
		this.loadingSubject.next(true);
		this.dataTreeDonVi = [];
		this.commonService.GetTreeDonViHC(0, this.idParent).subscribe(res => {
			this.loadingSubject.next(false);
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
			this.donvi = item.data;
		}
	}
	checkAllowExport() {
		return this.dot == 0 || this.donvi.Type != 'H';
	}
	In(mau = 1) {
		this.NienHanService1.previewDeXuatDot(this.dot, this.donvi.ID_Goc, mau).subscribe(res => {
			if (res && res.status == 1) {
				let dialogRef;
				if (mau > 1)
					dialogRef = this.dialog.open(ReviewExportComponent, { data: res.data, width: '1000px' });
				else
					dialogRef = this.dialog.open(ReviewExportComponent, { data: res.data });
				dialogRef.afterClosed().subscribe(res => {
					if (!res) {
					} else {
						this.NienHanService1.exportDeXuatDot(this.dot, this.donvi.ID_Goc, mau, mau > 1, res.loai).subscribe(response => {
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
							this.layoutUtilsService.showError("Tải xuống thất bại")
						});
					}
				})
			} 
			// else
			// 	this.layoutUtilsService.showError(res.error.message);
		})
	}
}
