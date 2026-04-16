import { Component, OnInit, ChangeDetectionStrategy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService, TypesUtilsService } from '../../../../../../core/_base/crud';
import * as moment from 'moment';
import { ActivatedRoute, Router } from '@angular/router';
import { NhapSoLieuDuyetService } from '../services/nhap-so-lieu-duyet.service';

@Component({
	selector: 'kt-duyet-so-lieu-page',
	templateUrl: './duyet-so-lieu-page.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class DuyetSoLieuPageComponent implements OnInit {
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

	constructor(
		private fb: FormBuilder,
		private objectService: NhapSoLieuDuyetService,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private typesUtilsService: TypesUtilsService,
		private actRoute: ActivatedRoute,
		private route: Router,
		public commonService: CommonService,
		private translate: TranslateService) {
			this._NAME = 'Nhập số liệu';
	}

	/** LOAD DATA */
	ngOnInit() {
		this.actRoute.paramMap.subscribe(params => {
			this.id = +params.get('id');
		});
		this.item.Id = this.id;
		this.item.IsVisible_Duyet = true;
		this.item.IsEnable_Duyet = false;
		this.objectService.detail(this.id).subscribe(res => {
			if (res && res.status == 1) {
				this.item = res.data;
				this.changeDetectorRefs.detectChanges();
				this.createForm();
			}
			else {
				this.layoutUtilsService.showError(res.error.message);
			}
		})
		this.createForm();
		this.viewLoading = false;
		this.changeDetectorRefs.detectChanges();
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
		this.objectService.Duyet(_item).subscribe(res => {
			this.loadingAfterSubmit = false;
			this.viewLoading = false;
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				this.layoutUtilsService.showInfo(_Message);
				this.item.Id = 0;//load lại comment
				this.changeDetectorRefs.detectChanges();
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
		window.history.back();
	}

	getWidth(){
		return window.innerWidth;
	}
}
