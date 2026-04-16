import { Component, OnInit, ChangeDetectionStrategy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService, QueryParamsModel, TypesUtilsService } from '../../../../../../core/_base/crud';
import * as moment from 'moment';
import { HoSoNCCDuyetService } from '../Services/ho-so-ncc-duyet.service';
import { HuongDanHuongThienDialogComponent } from '../huong-dan-hoan-thien/huong-dan-hoan-thien-dialog.component';
import { Sort } from '@angular/material/sort';

@Component({
	selector: 'kt-ho-so-ncc-duyet-page',
	templateUrl: './ho-so-ncc-duyet-page.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class HoSoNCCDuyetPageComponent implements OnInit {
	item: any = {};
	ListFile: any = [];
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
	maxNS = moment(new Date()).add(-16, 'year').toDate();
	Cap: number = 0;
	lstCap: any = [];

	constructor(
		private fb: FormBuilder,
		public dialog: MatDialog,
		private objectService: HoSoNCCDuyetService,
		private commonService: CommonService,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private typesUtilsService: TypesUtilsService,
		private route: Router,
		private actRoute: ActivatedRoute,
		private translate: TranslateService) {
			this._NAME = 'Hồ sơ người có công';
	}

	/** LOAD DATA */
	ngOnInit() {
		this.actRoute.paramMap.subscribe(params => {
			this.id = +params.get('id');
			this.getFiles();
		});
		this.item.Id = this.id;
		this.item.IsVisible_Duyet = true;
		this.item.IsEnable_Duyet = false;
		this.commonService.GetListOrganizationalChartStructure().subscribe(res => {
			if (res && res.status == 1)
				this.lstCap = res.data;
		})
		this.objectService.detail(this.id).subscribe(res => {
			if (res && res.status == 1) {
				this.item = res.data;
				this.createForm();
				this.changeDetectorRefs.detectChanges();
			}
			else {
				this.layoutUtilsService.showError(res.error.message);
			}
		})
		this.createForm();
		this.viewLoading = false;
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
		if (value) {
			const _Message = this.translate.instant('OBJECT.DUYET.MESSAGE', { name: this._NAME });
			this.Duyet(_item, value, _Message);
		} else {
			const _Message = this.translate.instant('OBJECT.KHONGDUYET.MESSAGE', { name: this._NAME });
			const dialogRef = this.dialog.open(HuongDanHuongThienDialogComponent, { data: { item: { id_quytrinh_lichsu: 0 } } });
			dialogRef.afterClosed().subscribe(res => {
				if (!res) {
				} else {
					_item.HuongDan = res._item;
					this.Duyet(_item, value, _Message);
				}
			});
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
				this.item.Id = 0; //load lại comment
				this.changeDetectorRefs.detectChanges();
				// this.ngOnInit();
				this.route.navigateByUrl('/duyet-ho-so');
			} else {
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	Download(src) {
		window.open(src, '_blank');
	}

	getFiles(sort: Sort = null) {
		let sortOrder = 'desc';
		if (sort && (!sort.active || sort.direction === '')) {
			sortOrder = sort.direction;
		}
		let f = { id: this.id, Cap: this.Cap };
		var filter = new QueryParamsModel(f, sortOrder, "CreatedDate", 1, 1, [], true);
		this.objectService.getFiles(filter).subscribe(res => {
			if (res && res.status == 1) {
				this.ListFile = res.data;
				this.changeDetectorRefs.detectChanges();
			}
			else {
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
		//this.route.navigateByUrl('/duyet-ho-so');
		window.history.back();
	}

	getWidth() {
		return window.innerWidth;
	}

	addComment($event) {
		if ($event.Attachment && $event.Attachment.length > 0) {
			this.getFiles();
		}
	}
}
