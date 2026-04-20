import { Component, OnInit, ChangeDetectionStrategy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Sort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { CommonService } from '../../../services/common.service';
import { HoSoNCCDuyetService } from '../Services/ho-so-ncc-duyet.service';
import { HuongDanHuongThienDialogComponent } from '../huong-dan-hoan-thien/huong-dan-hoan-thien-dialog.component';

@Component({
	selector: 'kt-ho-so-ncc-duyet-page',
	templateUrl: './ho-so-ncc-duyet-page.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class HoSoNCCDuyetPageComponent implements OnInit {
	item: any = {};
	ListFile: any = [];
	itemForm: FormGroup | undefined;
	viewLoading = false;
	disabledBtn = false;
	loadingAfterSubmit = false;
	isZoomSize: boolean = false;
	require = '';
	id = 0;
	@ViewChild('focusInput', { static: true }) focusInput: ElementRef | undefined;
	_NAME = '';
	Cap: number = 0;
	lstCap: any = [];

	constructor(
		private fb: FormBuilder,
		public dialog: MatDialog,
		private objectService: HoSoNCCDuyetService,
		private commonService: CommonService,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private route: Router,
		private actRoute: ActivatedRoute,
		private translate: TranslateService) {
			this._NAME = 'Hồ sơ người có công';
	}

	/** LOAD DATA */
	ngOnInit() {
		this.actRoute.paramMap.subscribe(params => {
			const idParam = params.get('id');
			this.id = idParam ? +idParam : 0;
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
		this.loadingAfterSubmit = false;
		if (!this.itemForm) return;
		const controls = this.itemForm.controls;
		/* check form */
		if (this.itemForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);
			return;
		}
		const item = this.prepareData();
		if (value) {
			const message = this.translate.instant('OBJECT.DUYET.MESSAGE', { name: this._NAME });
			this.Duyet(item, value, message);
		} 
		else {
			const message = this.translate.instant('OBJECT.KHONGDUYET.MESSAGE', { name: this._NAME });
			const dialogRef = this.dialog.open(HuongDanHuongThienDialogComponent, { data: { item: { id_quytrinh_lichsu: 0 } } });
			dialogRef.afterClosed().subscribe(res => {
				if (res) {
					item.HuongDan = res._item;
					this.Duyet(item, value, message);
				}
			});
		}
	}
	
	Duyet(item: any, value: boolean, message: string) {
		item.value = value;
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.objectService.Duyet(item).subscribe(res => {
			this.loadingAfterSubmit = false;
			this.viewLoading = false;
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				this.layoutUtilsService.showInfo(message);
				this.item.Id = 0; //load lại comment
				this.changeDetectorRefs.detectChanges();
				// this.ngOnInit();
				this.route.navigateByUrl('/duyet-ho-so');
			} else {
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	Download(src: string) {
		window.open(src, '_blank');
	}

	getFiles(sort: Sort | null = null) {
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
		if (!this.itemForm) return;
		this.itemForm.markAsPristine();
		this.itemForm.markAsUntouched();
		this.itemForm.updateValueAndValidity();
	}

	close() {
		window.history.back();
	}

	getWidth() {
		return window.innerWidth;
	}

	addComment($event: any) {
		if ($event.Attachment && $event.Attachment.length > 0) {
			this.getFiles();
		}
	}
}