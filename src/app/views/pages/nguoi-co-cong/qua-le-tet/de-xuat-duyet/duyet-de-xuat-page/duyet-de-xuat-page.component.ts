import { Component, OnInit, ChangeDetectionStrategy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';
import { ActivatedRoute, Router } from '@angular/router';
import { DeXuatDuyetService } from '../Services/de-xuat-duyet.service';

@Component({
	selector: 'kt-duyet-de-xuat-page',
	templateUrl: './duyet-de-xuat-page.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class DuyetDeXuatPageComponent implements OnInit {
	item: any = {};
	itemForm: FormGroup | undefined;
	hasFormErrors = false;
	viewLoading = false;
	disabledBtn = false;
	loadingAfterSubmit = false;
	isZoomSize: boolean = false;
	require = '';
	id: number = 0;
	@ViewChild('focusInput', { static: true }) focusInput: ElementRef | undefined;
	_NAME = '';
	tongMuc: any[] = [];
	tongSL: any[] = [];
	tongNguon: any[] = [];
	tongSLNguon: any[] = [];
	selected_tab: number = 0;
	TongSo: number = 0;
	TongTien: number = 0;

	constructor(
		private fb: FormBuilder,
		private objectService: DeXuatDuyetService,
		public commonService: CommonService,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private actRoute: ActivatedRoute,
		private route: Router,
		private translate: TranslateService) {
		this._NAME = 'Đề xuất tặng quà';
	}

	ngOnInit() {
		this.actRoute.paramMap.subscribe(params => {
			this.id = +(params.get('id') || 0);
		});
		this.item.Id = this.id;
		this.item.IsVisible_Duyet = true;
		this.item.IsEnable_Duyet = false;
		this.objectService.getItem(this.id, true).subscribe(res => {
			if (res && res.status == 1) {
				this.item = res.data;
				this.tinhTongMuc();
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

	tinhTongMuc() {
		this.TongSo = 0;
		this.TongTien = 0;
		this.tongMuc = [];
		this.tongSL = [];
		this.tongNguon = [];
		this.tongSLNguon = [];
		for (const detail of this.item.Details) {
			const tempTongMuc: any[] = [];
			const tempTongSL: any[] = [];
			let sNguon = 0;
			let cNguon = 0;
			for (const c1 of detail.data) {
				let s = 0;
				let c = 0;
				for (const c2 of c1.DoiTuongs) {
					for (const c3 of c2.NCCs) {
						const isHopLe = (this.selected_tab === 0 && c3.Checked && !c3.IsGiam)
									|| (this.selected_tab === 1 && c3.IsTang)
									|| (this.selected_tab === 2 && c3.IsGiam);

						if (!isHopLe) continue;
						s += this.commonService.stringToInt(c3.SoTien);
						c++;
					}
				}
				tempTongMuc.push(this.commonService.f_currency_V2('' + s));
				tempTongSL.push(c);
				this.TongSo += c;
				this.TongTien += s;
				sNguon += s;
				cNguon += c;
			}
			this.tongMuc.push(tempTongMuc);
			this.tongSL.push(tempTongSL);
			this.tongNguon.push(this.commonService.f_currency_V2('' + sNguon));
			this.tongSLNguon.push(cNguon);
		}
	}

	createForm() {
		const temp: any = {
			note: [''],
			FileDinhKem: [''],
		};
		this.itemForm = this.fb.group(temp);
	}

	getTitle(): string {
		let result = this._NAME;
		return result;
	}

	prepareData(): any {
		if (!this.itemForm) return;
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
		if (!this.itemForm) return;
		const controls = this.itemForm.controls;
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
			this.Duyet(_item, value, _Message);
		} else {
			const _Message = this.translate.instant('OBJECT.KHONGDUYET.MESSAGE', { name: this._NAME });
			this.Duyet(_item, value, _Message);
		}

	}

	Duyet(_item: any, value: boolean, _Message: string) {
		_item.value = value;
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.objectService.duyetDotTangQua(_item).subscribe(res => {
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
		if (!this.itemForm) return;
		this.itemForm.markAsPristine();
		this.itemForm.markAsUntouched();
		this.itemForm.updateValueAndValidity();
	}

	close() {
		this.route.navigateByUrl('/duyet-de-xuat');
	}

	changed_tab($event: any) {
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

	getWidth(){
		return window.innerWidth;
	}
	
	export() {
		this.objectService.exportExcelDeXuat(this.item.Id).subscribe(res => {
			const headers = res.headers;
			const filename = headers.get('x-filename');
			const type = headers.get('content-type');
			const blob = new Blob([res.body], { type });
			const fileURL = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = fileURL;
			link.download = filename;
			link.click();
		}, error => {
			this.layoutUtilsService.showInfo("Xuất file không thành công");
		})
	}
}