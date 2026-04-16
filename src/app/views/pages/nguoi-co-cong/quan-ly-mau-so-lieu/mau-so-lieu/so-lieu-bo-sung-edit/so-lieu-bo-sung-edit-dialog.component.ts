import { Component, OnInit, Inject, HostListener, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService, TypesUtilsService } from '../../../../../../core/_base/crud';
import { MauSoLieuService } from './../Services/mau-so-lieu.service';
import { FormSoLieuConModel } from '../Model/detail-list.model';

@Component({
	selector: 'kt-so-lieu-bo-sung-edit-dialog',
	templateUrl: './so-lieu-bo-sung-edit-dialog.component.html',
})

export class SoLieuBoSungEditDialogComponent implements OnInit {

	item: any;
	oldItem: any;
	object: any;
	itemForm: FormGroup;
	hasFormErrors = false;
	viewLoading = false;
	loadingAfterSubmit = false;
	disabledBtn = false;
	isZoomSize = false;
	listSoLieu: any[] = [];
	listLoaiSoLieu: any[] = [];
	uutien = 0;
	mota = '';
	listSoLieuChild: any = [];
	titleSoLieu = '';
	idMauSoLieu = 0;
	titleLoaiSoLieu = '';
	soLieuisSelected: any = [];
	filterSoLieu: number;
	tempListSoLieu: any[] = [];
	allowEdit = false;
	demolist: any[] = [];
	listDetail: any[] = [];

	@ViewChild('focusInput', { static: true }) focusInput: ElementRef;
	_name = '';

	/* Keyboard Shortcut Keys */
	@HostListener('document:keydown', ['$event'])
	onKeydownHandler(event: KeyboardEvent) {
		// lưu đóng
		if (event.altKey && event.keyCode == 13) { //phím Enter
			this.onSubmit(true);
		}
		//lưu tiếp tục
		if (event.ctrlKey && event.keyCode == 13) { //phím Enter
			this.onSubmit(false);
		}
	}

	constructor(
		public dialogRef: MatDialogRef<SoLieuBoSungEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		private commonService: CommonService,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private typesUtilsService: TypesUtilsService,
		private objectService: MauSoLieuService,
		private translate: TranslateService) {
			this._name = this.translate.instant('MAU_SO_LIEU.slbosung');
	}

	/** LOAD DATA */
	ngOnInit() {
		// deep copy object
		// *Important:	Nếu dùng assign thì đối tượng vẫn bị tham chiếu!!
		// if (this.data._item.IdSoLieu > 0) {
		// 	this.item = JSON.parse(JSON.stringify(this.data._item));
		// } else {
		// 	this.item = this.data._item;
		// }
		this.item = this.data._item;
		this.idMauSoLieu = this.data.idMauSoLieu;
		this.allowEdit = this.data.allowEdit;
		this.soLieuisSelected = this.data.soLieuisSelected;
		this.listDetail = this.data.listDetail;
		this.loadListSoLieu();
		this.createForm();
	}

	getLoaiSoLieu(filterSoLieu: number) {
		this.listSoLieuChild = [];
		let soLieu: any;
		this.objectService.getSoLieu(filterSoLieu).subscribe(data => {
			soLieu = data.data;
			this.titleSoLieu = data.data.SoLieu;
			this.titleLoaiSoLieu = data.data.LoaiSoLieu;
			this.mota = data.data.MoTa;
			this.uutien = data.data.Priority;
			for (const sl of soLieu.SoLieuChild) {
				sl.Detail = [];
				this.listSoLieuChild.push(sl);
			}
		});
	}

	createForm() {
		const temp: any = {
			SoLieu: ['', Validators.required],
			LoaiSoLieu: ['' + this.item.LoaiSoLieu],
			Priority: [],
			MoTa: []
		};
		this.itemForm = this.fb.group(temp);
		this.itemForm.controls.LoaiSoLieu.disable();
		this.itemForm.controls.Priority.disable();
		this.itemForm.controls.MoTa.disable();
		this.focusInput.nativeElement.focus();

		if (!this.allowEdit) {
			this.itemForm.disable();
		}
	}

	getListSoLieuTruocDo(): any[] {
		const tempListSoLieu: any[] = [];
		for (const soLieu of this.listDetail) {
			let sl: any = { id: 0 };
			sl.id = +soLieu.IdSoLieu;
			tempListSoLieu.push(sl);
		}
		return tempListSoLieu;
	}

	getSoLieuDaSelected(tempListSoLieu): any[] {
		if (this.soLieuisSelected.IdSoLieu > 0) {
			let sl: any = { id: 0 };
			sl.id = this.soLieuisSelected.IdSoLieu;
			this.tempListSoLieu.push(sl);
		}
		if (this.item.SoLieuCon.length > 0) {
			for (const solieu of this.item.SoLieuCon) {
				let sl: any = { id: 0 };
				sl.id = +solieu.IdSoLieu;
				sl.Id_Detail = this.item.Id_Detail;
				this.tempListSoLieu.push(sl);
			}
		}
		return tempListSoLieu;
	}

	loadListSoLieu() {
		this.tempListSoLieu = this.getListSoLieuTruocDo();
		this.tempListSoLieu = this.getSoLieuDaSelected(this.tempListSoLieu);
		this.commonService.liteSoLieuParentIsNull().subscribe(res => {
			this.listSoLieu = res.data;
			// không hiển thị số liệu đã được chọn
			this.tempListSoLieu.forEach(ele => {
				this.listSoLieu = this.listSoLieu.filter(item => item.id !== ele.id);
			});
		});
	}

	/** UI */
	getTitle(): string {
		return 'Thêm mới Số liệu bổ sung';
	}

	/** ACTIONS */
	prepareData(): any {

		const controls = this.itemForm.controls;
		const _item: any = new FormSoLieuConModel;
		_item.clear();
		_item.Id_Detail = this.item.Id_Detail;
		_item.IdSoLieu = +controls.SoLieu.value;
		_item.SoLieu = this.titleSoLieu;
		_item.LoaiSoLieu = this.titleLoaiSoLieu;
		_item.MoTa = this.mota;
		_item.Priority = this.uutien;
		_item.Detail = this.item.Detail;
		if (_item.Detail == undefined) {
			_item.Detail = [];
		}
		return _item;
	}

	onSubmit(withBack: boolean) {
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
		const soLieuConModel = this.prepareData();
		if (this.item.Id_Detail > 0) {
			this.Update(soLieuConModel, withBack);
		} else {
			this.Create(soLieuConModel, withBack);
		}
	}

	Update(soLieuConModel: any, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.item.SoLieuCon.push(soLieuConModel);
		this.disabledBtn = true;
		if (this.listSoLieuChild.length > 0) {
			for (const sl of this.listSoLieuChild) {
				this.item.SoLieuCon.push(sl);
			}
		}
		this.objectService.CreateSoLieuCon(this.data.idMauSoLieu, this.item).subscribe(res => {
			if (res && res.status === 1) {
				this.dialogRef.close({});
			} else {
				if (res.error.allowForce)
				{
					const dialogRef = this.layoutUtilsService.deleteElement("Cảnh báo", res.error.message, 'Yêu cầu đang được xử lý');
					dialogRef.afterClosed().subscribe(res => {
						if (!res) return;
						let object1: any = Object.assign({},soLieuConModel)
						object1.Force=true;
						this.Update(object1,withBack);
					});

				} else
					this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	Create(object: any, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.item.SoLieuCon.push(object);
		for (const sl of this.listSoLieuChild) {
			sl.Id_Detail = this.item.Id_Detail;
			sl.Detail = [];
			this.item.SoLieuCon.push(sl);
		}
		this.changeDetectorRefs.detectChanges();
		if (withBack == true) {
			this.close();
		} else {
			this.disabledBtn = false;
			this.ngOnInit();
		}
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}
	
	close() {
		this.dialogRef.close();
	}
}
