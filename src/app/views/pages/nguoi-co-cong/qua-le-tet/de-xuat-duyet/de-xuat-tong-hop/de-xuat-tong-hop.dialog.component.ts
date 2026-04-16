import { Component, OnInit, ChangeDetectorRef, Inject, ViewEncapsulation, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { merge, BehaviorSubject } from 'rxjs';
//Service
import { DomSanitizer } from '@angular/platform-browser';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';
import { CommonService } from '../../../services/common.service';
import { DeXuatDuyetService } from '../Services/de-xuat-duyet.service';

@Component({
	selector: 'kt-de-xuat-tong-hop',
	templateUrl: './de-xuat-tong-hop.dialog.component.html',
	encapsulation: ViewEncapsulation.None,
})

export class DeXuatTongHopDialogComponent implements OnInit {

	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	viewLoading: boolean = false;
	isZoomSize: boolean = false;
	disabledBtn: boolean = false;
	treeNguoiNhan: any[] = [];
	tongMuc: any[] = [];
	tongSL: any[] = [];
	_name: string = '';
	note: string = '';
	allowEdit: boolean = true;
	selected_tab: number = 0;

	/* Keyboard Shortcut Keys */
	@HostListener('document:keydown', ['$event'])
	onKeydownHandler(event: KeyboardEvent) {
		if (event.ctrlKey && event.keyCode == 13) { //phím Enter
			this.duyets();
		}
	}
	
	constructor(
		public dialogRef: MatDialogRef<DeXuatTongHopDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private translate: TranslateService,
		private changeDetect: ChangeDetectorRef,
		private layoutUtilsService: LayoutUtilsService,
		public commonService: CommonService,
		private DeXuatService1: DeXuatDuyetService,
		private sanitized: DomSanitizer) {
		this._name = this.translate.instant("DE_XUAT.NAME");
	}

	transform(value) {
		return this.sanitized.bypassSecurityTrustHtml(value);
	}

	/** LOAD DATA */
	ngOnInit() {
		if (this.data.allowEdit != undefined)
			this.allowEdit = this.data.allowEdit;
		this.DeXuatService1.tongHopDeXuatDot(this.data.data).subscribe(res => {
			if (res && res.status == 1) {
				this.treeNguoiNhan = res.data;
				this.tinhTongMuc();
			} else
				this.layoutUtilsService.showError(res.error.message);
		})
	}

	tinhTongMuc() {
		this.tongMuc = [];
		this.tongSL = [];
		for (let ng of this.treeNguoiNhan) {
			let tongMuc = [];
			let tongSL = [];
			for (let c1 of ng.Details) {
				let s = 0;
				let c = 0;
				for (let c2 of c1.DoiTuongs) {
					for (let c3 of c2.NCCs) {
						if ((this.selected_tab == 0 && c3.Checked && !c3.IsGiam)
							|| (this.selected_tab == 1 && c3.IsTang)
							|| (this.selected_tab == 2 && c3.IsGiam)) {
							let tien = this.commonService.stringToInt(c3.SoTien);
							s += tien;
							c++;
						}
					}
				}
				tongMuc.push(this.commonService.f_currency_V2('' + s));
				tongSL.push(c);
			}
			this.tongMuc.push(tongMuc);
			this.tongSL.push(tongSL);
		}
	}

	sumSL(j, count) {
		let s = 0;
		for(let i=0; i<count; i++) {
			s += this.tongSL[j][i]
		}
		return s;
	}

	sumTien(j, count) {
		let s = 0;
		for(let i=0; i<count; i++) {
			s += this.commonService.stringToInt(this.tongMuc[j][i])
		}
		return this.commonService.f_currency_V2('' + s);
	}

	duyets() {
		var data = {
			ids: this.data.data.ids,
			value: true,
			note: this.note,
			isTongHop: true
		};
		const _title = this.translate.instant('OBJECT.DUYET.TITLE', { name: this._name.toLowerCase() });
		const _description = this.translate.instant('OBJECT.DUYET.DESCRIPTION', { name: this._name.toLowerCase() });
		const _waitDesciption = this.translate.instant('OBJECT.DUYET.WAIT_DESCRIPTION', { name: this._name.toLowerCase() });
		const _deleteMessage = this.translate.instant('OBJECT.DUYET.MESSAGE', { name: this._name });

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			this.DeXuatService1.Duyets(data).subscribe(res => {
				if (res && res.status === 1) {
					let str = " " + res.data.success + "/" + res.data.total;
					this.layoutUtilsService.showInfo(_deleteMessage + str);
					this.dialogRef.close(true);
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
			});
		});
	}
	
	closeDialog() {
		this.dialogRef.close();
	}
	
	changed_tab($event) {
		this.selected_tab = $event;
		this.tinhTongMuc();
	}

	checkDisplay(ncc: any) {
		if (this.selected_tab == 0)
			return ncc.Checked && !ncc.IsGiam;
		if (this.selected_tab == 1)
			return ncc.IsTang;
		if (this.selected_tab == 2)
			return ncc.IsGiam;
	}

	checkDisplay2(arr: any[]) {
		if (this.selected_tab == 0) //dữ liệu hưởng gồm kế thừa & tăng
			return arr.filter(ncc => ncc.Checked && !ncc.IsGiam);
		if (this.selected_tab == 1)
			return arr.filter(ncc => ncc.IsTang);
		if (this.selected_tab == 2)
			return arr.filter(ncc => ncc.IsGiam);
	}
}
