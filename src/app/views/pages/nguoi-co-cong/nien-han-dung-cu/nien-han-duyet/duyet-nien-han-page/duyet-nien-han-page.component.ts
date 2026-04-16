import { Component, OnInit, ChangeDetectionStrategy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService, TypesUtilsService } from '../../../../../../core/_base/crud';
import { ActivatedRoute, Router } from '@angular/router';
import { NienHanDuyetService } from '../Services/nien-han-duyet.service';

@Component({
	selector: 'kt-duyet-nien-han-page',
	templateUrl: './duyet-nien-han-page.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class DuyetNienHanPageComponent implements OnInit {
	item: any = {};
	itemForm: FormGroup;
	hasFormErrors = false;
	viewLoading = false;
	disabledBtn = false;
	loadingAfterSubmit = false;
	isZoomSize: boolean = false;
	require = '';
	id = 0;
	@ViewChild('focusInput', { static: true }) focusInput: ElementRef;
	_NAME = '';
	tongDT = [];
	tongSL = [];
	selected_tab: number = 0;
	TongSo: number = 0;
	TongTien: number = 0;
	isxa = false;
	loaicmt: number = 7;

	constructor(
		private fb: FormBuilder,
		private objectService: NienHanDuyetService,
		private commonService: CommonService,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private typesUtilsService: TypesUtilsService,
		private actRoute: ActivatedRoute,
		private route: Router,
		private translate: TranslateService) {
		this._NAME = 'Niên hạn dụng cụ';
	}

	/** LOAD DATA */
	ngOnInit() {
		this.actRoute.paramMap.subscribe(params => {
			this.id = +params.get('id');
			this.isxa = params.get('isxa') == "true";
			if (this.isxa)
				this.loaicmt = 6
		});
		this.item.Id = this.id;
		this.item.IsVisible_Duyet = true;
		this.item.IsEnable_Duyet = false;
		this.objectService.getItem(this.id, true, this.isxa).subscribe(res => {
			if (res && res.status == 1) {
				this.item = res.data;
				this.tinhtongDT();
				this.createForm();
				this.changeDetectorRefs.detectChanges();
			}
			else {
				this.layoutUtilsService.showError(res.error.message);
			}
		})
		this.createForm();
		this.viewLoading = false;
		this.changeDetectorRefs.detectChanges();
	}

	tinhtongDT() {
		this.TongSo = 0;
		this.TongTien = 0;
		this.tongDT = []
		this.tongSL = []
		for (let i = 0; i < this.item.Details.length; i++) {
			let NCCs = this.item.Details[i].NCCs;
			let s = 0;
			let c = 0;

			for (let c1 of NCCs) {
				if ((this.selected_tab == 0 && c1.Checked && !c1.IsGiam)
					|| (this.selected_tab == 1 && c1.IsTang)
					|| (this.selected_tab == 2 && c1.IsGiam)) {
					let tien = c1.SoTien
					s += tien;
					c++;
				}
			}
			this.tongDT.push(this.commonService.f_currency_V2('' + s));
			this.tongSL.push(c);

			this.TongSo += c;
			this.TongTien += s;
		}
	}
	createForm() {
		const temp: any = {
			note: [''],
			FileDinhKem: [''],
		};

		this.itemForm = this.fb.group(temp);
	}

	/** UI */
	getTitle(): string {
		let result = this._NAME;
		return result;
	}

	/** ACTIONS */
	prepareData(): any {
		const controls = this.itemForm.controls;
		let _item: any = {};
		let Id: number;
		let note: string;
		Id = this.id;
		note = controls.note.value;
		_item = { Id, note };
		let file = controls.FileDinhKem.value;
		if (file && file.length > 0)
			_item.FileDinhKem = file[0];
		return _item;
	}

	onSubmit(value: boolean) {
		this.hasFormErrors = false;
		this.loadingAfterSubmit = false;
		const controls = this.itemForm.controls;
		/* check form */
		if (this.itemForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			return;
		}
		const _item = this.prepareData();
		if (value === true) {
			const _Message = this.translate.instant('OBJECT.DUYET.MESSAGE', { name: this._NAME });
			this.Duyet(_item, value, _Message, this.isxa);
		} else {
			const _Message = this.translate.instant('OBJECT.KHONGDUYET.MESSAGE', { name: this._NAME });
			this.Duyet(_item, value, _Message, this.isxa);
		}

	}

	Duyet(_item: any, value: boolean, _Message: string, isxa: boolean=false) {
		_item.value = value;
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.objectService.duyetNienHan(_item, isxa).subscribe(res => {
			this.loadingAfterSubmit = false;
			this.viewLoading = false;
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				this.layoutUtilsService.showInfo(_Message);
				this.item.Id = 0;//load lại comment
				this.changeDetectorRefs.detectChanges();
				// this.ngOnInit();
				this.close();
			} else {
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	reset() {
		this.item = Object.assign({}, this.item);
		this.createForm();
		this.hasFormErrors = false;
		this.itemForm.markAsPristine();
		this.itemForm.markAsUntouched();
		this.itemForm.updateValueAndValidity();
	}
	onAlertClose($event) {
		this.hasFormErrors = false;
	}
	close() {
		this.route.navigateByUrl('/duyet-nien-han');
	}
	changed_tab($event) {
		this.selected_tab = $event;
		this.tinhtongDT();
	}
	checkDisplay(ncc) {
		if (this.selected_tab == 0)
			return ncc.Checked && !ncc.IsGiam;
		if (this.selected_tab == 1)
			return ncc.IsTang;
		if (this.selected_tab == 2)
			return ncc.IsGiam;
	}

	getWidth(){
		return window.innerWidth;
	}
	export() {
		this.objectService.exportExcelNienHan(this.item.Id, this.isxa).subscribe(res => {
			const headers = res.headers;
			const filename = headers.get('x-filename');
			const type = headers.get('content-type');
			const blob = new Blob([res.body], { type });
			const fileURL = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = fileURL;
			link.download = filename;
			link.click();
		})
	}
}
