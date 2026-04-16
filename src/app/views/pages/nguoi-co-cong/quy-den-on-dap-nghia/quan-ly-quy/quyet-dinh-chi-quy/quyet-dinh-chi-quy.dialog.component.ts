import { Component, OnInit, Inject, ChangeDetectionStrategy, ViewChild, ElementRef, ChangeDetectorRef, HostListener } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService, TypesUtilsService } from '../../../../../../core/_base/crud';
import { TokenStorage } from 'app/core/auth/_services/token-storage.service';
import { QDChiModel } from '../Model/dong-gop-quy.model';
import { QuanLyQuyService } from '../Services/quan-ly-quy.service';

@Component({
	selector: 'kt-quyet-dinh-chi-quy',
	templateUrl: './quyet-dinh-chi-quy.dialog.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class ChiQuyChiDialogComponent implements OnInit {
	item: QDChiModel;
	oldItem: any;
	itemForm: FormGroup;
	hasFormErrors: boolean = false;
	viewLoading: boolean = false;
	loadingAfterSubmit: boolean = false;
	disabledBtn = false;
	allowEdit = false;
	isZoomSize: boolean = false;
	Capcocau: number;
	listND: any[] = [];
	@ViewChild("focusInput", { static: true }) focusInput: ElementRef;
	_name = "";

	/* Keyboard Shortcut Keys */
	@HostListener('document:keydown', ['$event'])
	onKeydownHandler(event: KeyboardEvent) {
		if (event.ctrlKey && event.keyCode == 13) { //phím Enter
			this.onSubmit();
		}
	}

	constructor(public dialogRef: MatDialogRef<ChiQuyChiDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private QuanLyQuyService: QuanLyQuyService,
		private typesUtilsService: TypesUtilsService,
		private tokenStorage: TokenStorage,
		private commonService: CommonService,
		private translate: TranslateService) {
		this._name = this.translate.instant("CHIQUY.CHI");
	}
	ngOnInit() {
		this.tokenStorage.getUserInfo().subscribe(res => {
			this.Capcocau = res.Capcocau;
		})
		this.item = this.data._item;
		if (this.item)
			this.createForm();
	}

	createForm() {
		const temp: any = {
			SoQD: ['', Validators.required],
			NgayQD: [new Date(), Validators.required],
		};

		this.itemForm = this.fb.group(temp);
		this.changeDetectorRefs.detectChanges();
	}

	/** ACTIONS */
	prepareCustomer(): QDChiModel {
		const controls = this.itemForm.controls;
		this.item.SoQD = controls.SoQD.value;
		if (controls.NgayQD.value !== '')
			this.item.NgayQD = this.commonService.f_convertDate(controls.NgayQD.value);
		
		return this.item;
	}
	onSubmit() {
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

		const _title = this.translate.instant('Xác nhận chi');
		const _description = this.translate.instant('Bạn có chắc muốn chi cho nội dung này?');
		const _waitDesciption = this.translate.instant('Yêu cầu đang được xử lý ...');

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			const EditChiQuy = this.prepareCustomer();
			this.CreateChiQuy(EditChiQuy, true);
		});
	}
	CreateChiQuy(_item: QDChiModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.QuanLyQuyService.ChiQuy(_item).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				if (withBack == true) {
					this.dialogRef.close({
						_item
					});
				}
				else {
					const _messageType = this.translate.instant('OBJECT.EDIT.ADD_MESSAGE', { name: this._name });
					this.layoutUtilsService.showInfo(_messageType).afterDismissed().subscribe(tt => { });
					this.focusInput.nativeElement.focus();
					this.ngOnInit();
				}
			}
			else {
				this.viewLoading = false;
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
		this.dialogRef.close();
	}
}