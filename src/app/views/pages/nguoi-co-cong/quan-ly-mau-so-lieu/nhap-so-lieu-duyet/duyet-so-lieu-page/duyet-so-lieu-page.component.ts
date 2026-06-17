import { Component, OnInit, ChangeDetectionStrategy, ViewChild, ElementRef, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';
import { NhapSoLieuDuyetService } from '../Services/nhap-so-lieu-duyet.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
	selector: 'kt-duyet-so-lieu-page',
	templateUrl: './duyet-so-lieu-page.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DuyetSoLieuPageComponent implements OnInit, OnDestroy {
	private destroy$ = new Subject<void>();
	item: any = {};
	itemForm: FormGroup = new FormGroup({});
	viewLoading = false;
	disabledBtn = false;
	require = '';
	id = 0;
	@ViewChild('focusInput', { static: true }) focusInput: ElementRef | undefined;
	_NAME: string = '';

	constructor(
		private fb: FormBuilder,
		private objectService: NhapSoLieuDuyetService,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private actRoute: ActivatedRoute,
		public commonService: CommonService,
		private translate: TranslateService) {
			this._NAME = 'Nhập số liệu';
	}

	ngOnInit() {
		this.actRoute.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
			this.id = +(params.get('id') || 0);
		});
		this.item.Id = this.id;
		this.item.IsVisible_Duyet = true;
		this.item.IsEnable_Duyet = false;
		this.objectService.detail(this.id).pipe(takeUntil(this.destroy$)).subscribe(res => {
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

	ngOnDestroy() {
		this.destroy$.next();
		this.destroy$.complete();
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
		const controls = this.itemForm.controls;
		if (this.itemForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);
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

	Duyet(item: any, value: boolean, message: string) {
		item.value = value;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.objectService.Duyet(item).pipe(takeUntil(this.destroy$)).subscribe(res => {
			this.viewLoading = false;
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				this.layoutUtilsService.showInfo(message);
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
		this.itemForm.markAsPristine();
		this.itemForm.markAsUntouched();
		this.itemForm.updateValueAndValidity();
	}

	close() {
		window.history.back();
	}

	getWidth(){
		return window.innerWidth;
	}
}