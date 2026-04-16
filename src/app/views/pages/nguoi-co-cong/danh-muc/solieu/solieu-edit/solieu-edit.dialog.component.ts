import { Component, OnInit, Inject, ChangeDetectionStrategy, HostListener, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { solieuModel } from '../../solieu/Model/solieu.model';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { TranslateService } from '@ngx-translate/core';
import { solieuService } from '../Services/solieu.service';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';
import { ReplaySubject } from 'rxjs';

@Component({
	selector: 'm-solieu-edit-dialog',
	templateUrl: './solieu-edit.dialog.component.html',
})

export class solieuEditDialogComponent implements OnInit {
	item: solieuModel;
	oldItem: solieuModel
	itemForm: FormGroup;
	hasFormErrors: boolean = false;
	viewLoading: boolean = false;
	filterDonVi: string = '';
	loadingAfterSubmit: boolean = false;
	listchucdanh: any[] = [];
	disabledBtn = false;
	allowEdit = false;
	isZoomSize: boolean = false;

	FilterCtrl1: string = '';
	listOptSLCha: any[] = []
	listSLCha: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

	listSLCons: any[] = []

	listSLLite: any[] = []
	id: number
	idloai: number

	@ViewChild("focusInput", { static: true }) focusInput: ElementRef;
	_name = "";
	listLoaiSoLieu: any[] = [];

	FilterCtrl: string = '';
	listOpt: any[] = [];
	listFilter: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

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
	constructor(public dialogRef: MatDialogRef<solieuEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		private danhMucService: CommonService,
		public solieuService: solieuService,
		private changeDetectorRefs: ChangeDetectorRef,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService) {
		this._name = this.translate.instant("SO_LIEU.NAME");

	}

	/** LOAD DATA */
	ngOnInit() {
		this.item = this.data._item; 
		this.allowEdit = this.data.allowEdit;
		this.id = this.item.Id;

		this.createForm();
		if (this.item.Id > 0) { //đang sửa hoặc xem
			this.viewLoading = true;
			this.loadCacSLCon(this.id)

			this.solieuService.getItem(this.item.Id).subscribe(res => {
				this.viewLoading = false;
				this.changeDetectorRefs.detectChanges();
				if (res && res.status == 1) {
					this.item = res.data;
					this.idloai = this.item.Id_LoaiSoLieu
					this.loadSLCha();
					this.loadCacSLCon(this.id);
					this.createForm();
				}
				else
					this.layoutUtilsService.showError(res.error.message);
			});
		}
		this.loadList();
	}

	loadList() {
		this.danhMucService.liteLoaiSoLieu().subscribe(res => {
			this.listLoaiSoLieu = res.data;
			this.changeDetectorRefs.detectChanges();
		});
		this.danhMucService.liteFilter().subscribe(res => {
			this.listOpt = res.data;
			this.listFilter.next(res.data);
		});
	}

	loadSLCha() {
		this.solieuService.loadParent(this.itemForm.controls.Id_LoaiSoLieu.value).subscribe(res => {
			this.listOptSLCha = res.data;
			if (this.item.Id > 0)
				this.listOptSLCha = this.listOptSLCha.filter(x => x.Id != this.item.Id);
			this.listSLCha.next(this.listOptSLCha);
			this.changeDetectorRefs.detectChanges();
		})
	}

	loadCacSLCon(id: number) {
		this.solieuService.loadChilds(id).subscribe(res => {
			this.listSLCons = res.data;
			this.changeDetectorRefs.detectChanges();
		})
	}

	filter() {
		if (!this.listOpt) {
			return;
		}
		let search = this.FilterCtrl;
		if (!search) {
			this.listFilter.next(this.listOpt.slice());
			return;
		} else {
			search = search.toLowerCase();
		}
		this.listFilter.next(
			this.listOpt.filter(ts =>
				ts.title.toLowerCase().indexOf(search) > -1)
		);
		this.changeDetectorRefs.detectChanges();
	}

	filter1() {
		if (!this.listOptSLCha) {
			return;
		}
		let search = this.FilterCtrl1;
		if (!search) {
			this.listSLCha.next(this.listOptSLCha.slice());
			return;
		} else {
			search = search.toLowerCase();
		}
		this.listSLCha.next(
			this.listOptSLCha.filter(ts =>
				ts.SoLieu.toLowerCase().indexOf(search) > -1)
		);
		this.changeDetectorRefs.detectChanges();
	}

	createForm() {
		this.itemForm = this.fb.group({
			SoLieu: [this.item.SoLieu, Validators.required],
			Id_LoaiSoLieu: [this.item.Id_LoaiSoLieu, Validators.required],
			Id_SoLieuParent: [this.item.Id_Parent == null ? 0 : this.item.Id_Parent],
			MoTa: [this.item.MoTa],
			Locked: [this.item.Locked],
			Priority: [this.item.Priority],
			Id_Filter: [this.item.Id_Filter == null ? 0 : this.item.Id_Filter]
		});
		this.focusInput.nativeElement.focus();

		if (!this.allowEdit) //false thì không cho sửa
			this.itemForm.disable();
	}

	/** UI */
	getTitle(): string {
		let result = this.translate.instant('SO_LIEU.ADD');
		if (!this.item || !this.item.Id) {
			return result;
		}
		if (!this.allowEdit) {
			result = this.translate.instant('SO_LIEU.DETAIL') + `- ${this.item.SoLieu}`;
			return result;
		}
		result = this.translate.instant('SO_LIEU.UPDATE') + `- ${this.item.SoLieu}`;
		return result;
	}

	/** ACTIONS */
	prepareCustomer(): solieuModel {
		const controls = this.itemForm.controls;
		const _item = new solieuModel();
		_item.Id = this.item.Id;
		_item.SoLieu = controls['SoLieu'].value;
		_item.Id_LoaiSoLieu = +controls['Id_LoaiSoLieu'].value;
		_item.Id_Parent = +controls['Id_SoLieuParent'].value;
		_item.MoTa = controls['MoTa'].value;
		_item.Locked = controls['Locked'].value;
		_item.Priority = +controls['Priority'].value;
		_item.Id_Filter = +controls['Id_Filter'].value;
		return _item;
	}

	onSubmit(withBack: boolean = false) {
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
		if (controls.Priority.value < 0 || controls.Priority.value === '') {
			this.hasFormErrors = true;
			return;
		}

		const Editsolieu = this.prepareCustomer();
		if (Editsolieu.Id > 0) {
			this.UpdateNhom(Editsolieu, withBack);
		} else {
			this.CreateNhom(Editsolieu, withBack);
		}
	}

	closeForm() {
		this.dialogRef.close();
	}

	UpdateNhom(_item: solieuModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		if (_item.Id_LoaiSoLieu != this.idloai && this.listSLCons.length > 0) { //số liệu có số liệu con ko dc thay đổi loại số liệu
			this.layoutUtilsService.showError("Số liệu này không được cập nhật loại số liệu");
			return;
		}

		this.disabledBtn = true;
		this.solieuService.updatesolieu(_item).subscribe(res => {
			/* Server loading imitation. Remove this on real code */
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				if (withBack == true) {  //lưu và đóng, withBack = true
					this.dialogRef.close({
						_item
					});
				}
				else { //lưu và thêm mới, withBack = false
					this.ngOnInit(); //khởi tạo lại dialog
					const _messageType = this.translate.instant('OBJECT.EDIT.UPDATE_MESSAGE', { name: this._name });
					this.layoutUtilsService.showInfo(_messageType).afterDismissed().subscribe(tt => { });
					this.focusInput.nativeElement.focus();
				}
			}
			else {
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	CreateNhom(_item: solieuModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.solieuService.createsolieu(_item).subscribe(res => {
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

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

	close() {
		this.dialogRef.close();
	}
}
