import { Component, OnInit, ChangeDetectorRef, ComponentRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { Moment } from 'moment';
import { Subject } from 'rxjs';
import { CommonService } from '../../services/common.service';

@Component({
	selector: 'tr[dc-than-nhan-row-edit]',
	templateUrl: './dc-than-nhan-row-edit.component.html',
})

export class DCThanNhanRowEditComponent implements OnInit {
	public close$ = new Subject<void>();
	data: any;
	item: any;
	hasFormErrors = false;
	viewLoading = false;
	loadingAfterSubmit = false;
	disabledBtn = false;
	allowEdit = false;

	maxNS: Moment | undefined;
	cmpRef: ComponentRef<any> | undefined;

	//form controls
	HoTenDung: FormControl | undefined;
	NamSinhDung: FormControl | undefined;
	CuTruDung: FormControl | undefined;
	HoTenSai: FormControl | undefined;
	NamSinhSai: FormControl | undefined;
	CuTruSai: FormControl | undefined;
	GhiChu: FormControl| undefined;

	showDel: boolean = true //mđ hiện cột xóa hàng
	showGhiChu: boolean = true //mđ hiện cột ghi chú
	showCuTru: boolean = false //mđ ẩn 2 cột căn cứ

	constructor(
		public commonService: CommonService,
		private changeDetectorRefs: ChangeDetectorRef,
		private translate: TranslateService) {
	}

	ngOnInit() {
		this.maxNS = moment(new Date());
		this.item = this.data._item;

		if (this.item.showDel != undefined)
			this.showDel = this.item.showDel;
		if (this.item.showGhiChu != undefined)
			this.showGhiChu = this.item.showGhiChu;
		if (this.item.showCuTru != undefined)
			this.showCuTru = this.item.showCuTru;
			
		this.createForm();
	}

	createForm() {
		this.HoTenDung = new FormControl(this.item.HoTenDung); //, Validators.required
		this.NamSinhDung = new FormControl(this.item.NamSinhDung); 
		this.CuTruDung = new FormControl(this.item.CuTruDung); 
		this.HoTenSai = new FormControl(this.item.HoTenSai); 
		this.NamSinhSai = new FormControl(this.item.NamSinhSai);
		this.CuTruSai = new FormControl(this.item.CuTruSai); 
		this.GhiChu = new FormControl(this.item.GhiChu);
		this.changeDetectorRefs.detectChanges();
	}

	/** ACTIONS */
	prepareCustomer(): any {
		const _item: any = {};
		_item.HoTenDung = this.HoTenDung ? this.HoTenDung.value : "";
		_item.NamSinhDung = this.NamSinhDung ? this.NamSinhDung.value : "";
		_item.CuTruDung = this.CuTruDung ? this.CuTruDung.value : "";
		_item.HoTenSai = this.HoTenSai ? this.HoTenSai.value : "";
		_item.NamSinhSai = this.NamSinhSai ? this.NamSinhSai.value : "";
		_item.CuTruSai = this.CuTruSai ? this.CuTruSai.value : "";
		_item.GhiChu = this.GhiChu ? this.GhiChu.value : "";
		return _item;
	}

	onSubmit() {
		this.hasFormErrors = false;
		this.loadingAfterSubmit = false;
		const EditTroCap = this.prepareCustomer();
		return EditTroCap;
	}

	close() {
		this.close$.next();
	}

	reset() {
		this.item = Object.assign({}, this.item);
		this.createForm();
		this.hasFormErrors = false;
	}
}