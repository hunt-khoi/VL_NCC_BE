// Angular
import { Component, OnInit, Inject, HostListener, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ReplaySubject } from 'rxjs';
// Service
import { LayoutUtilsService, TypesUtilsService } from '../../../../../../core/_base/crud';
import { CommonService } from '../../../services/common.service';
import { MauSoLieuService } from '../Services/mau-so-lieu.service';
import { FormMauSoLieuDetailModel } from '../Model/detail-list.model';
import { PhiSoLieuEditDialogComponent } from '../phi-so-lieu-edit/phi-so-lieu-edit-dialog.component';

@Component({
	selector: 'kt-mau-so-lieu-detail-edit-dialog',
	templateUrl: './mau-so-lieu-detail-edit-dialog.component.html',
})

export class MauSoLieuDetailEditDialogComponent implements OnInit {
	item: any;
	oldItem: any;
	object: any;
	itemForm: FormGroup;
	hasFormErrors = false;
	viewLoading = false;
	loadingAfterSubmit = false;
	disabledBtn = false;
	allowCreate = false;
	allowEdit = false;

	FilterCtrl: string = '';
	listOpt: any[] = [];
	listSoLieu: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
	listCachNhap: any[] = [];

	filterSoLieu: number;
	titleLoaiSoLieu = '';
	titleSoLieu = '';
	listSoLieuChild: any = [];
	soLieuisSelected: any = {};
	idMauSoLieu: number;
	listDetail: any[] = [];
	tempListSoLieu: any[] = [];
	showBtnAddPhiSoLieu: boolean = false;
	isCreate: boolean = false;
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
		public dialogRef: MatDialogRef<MauSoLieuDetailEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		public dialog: MatDialog,
		public commonService: CommonService,
		private objectService: MauSoLieuService,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private typesUtilsService: TypesUtilsService,
		private translate: TranslateService) {
			this._name = 'Số liệu';
	}

	/** LOAD DATA */
	ngOnInit() {
		this.filterSoLieu = undefined;
		this.soLieuisSelected.Detail = [];
		this.listSoLieuChild = [];
		if (this.data._item.Id > 0) {
			this.idMauSoLieu = this.data._item.Id;
		} else {
			this.idMauSoLieu = 0;
		}
		// deep copy object
		// *Important:	Nếu dùng assign thì đối tượng vẫn bị tham chiếu!!
		if (this.data._item.IdSoLieu > 0) {
			this.item = this.data._item;
			this.soLieuisSelected = this.item;
			this.filterSoLieu = this.soLieuisSelected.IdSoLieu;

		} else {
			this.item = new FormMauSoLieuDetailModel();
			this.item.clear();
		}
		this.listDetail = this.data._listDetail;
		this.titleLoaiSoLieu = this.item.LoaiSoLieu;
		this.allowCreate = this.data.allowCreate;
		this.allowEdit = this.data.allowEdit;
		this.loadListSoLieu();
		this.loadListCachNhap();
		this.createForm();
		if (this.item.IdSoLieu > 0) {
			this.viewLoading = true;
			this.createForm();
		}
	}

	createForm() {
		const temp: any = {
			SoLieu: [null, Validators.required],
			SoLieuInp: ['' + this.item.SoLieu, Validators.required],
			LoaiSoLieu: ['' + this.item.LoaiSoLieu, Validators.required],
			default: [this.item.default],
		};
		const sl = this.listOpt.find(c => c.id == this.filterSoLieu);
		this.itemForm = this.fb.group(temp);
		this.itemForm.controls['SoLieu'].setValue(sl);
		if (!this.allowCreate || this.item.IdSoLieu > 0) {
			this.itemForm.controls.SoLieu.disable();
		}
		this.itemForm.controls.SoLieuInp.disable();
		this.itemForm.controls.LoaiSoLieu.disable();

		if (!this.allowEdit) {
			this.itemForm.disable();
		}
	}

	getLoaiSoLieu(filterSoLieu: number) {
		this.listSoLieuChild = [];
		let soLieu: any = [];
		this.objectService.getSoLieu(filterSoLieu).subscribe(data => {
			soLieu = data.data;
			this.soLieuisSelected = soLieu;
			this.soLieuisSelected.Detail = [];
			this.showBtnAddPhiSoLieu = true;
			this.titleSoLieu = data.data.SoLieu;
			this.titleLoaiSoLieu = data.data.LoaiSoLieu;
			for (const sl of soLieu.SoLieuChild) {
				sl.Detail = [];
				sl.Detail.Id_Detail = 0;
				this.listSoLieuChild.push(sl);
			}
		});
	}
	/** UI */
	getTitle(): string {
		let result = 'Chọn số liệu';
		if (!this.allowEdit) {
			result = 'Xem chi tiết';
			return result;
		}
		if (this.item.Id_Detail < 1) {
			this.isCreate = true;
			return result;
		}
		return result;
	}

	EditObject(_item: any, allowEdit = true) {
		let saveMessageTranslateParam = _item.IdSoLieu > 0 ? 'OBJECT.EDIT.UPDATE_MESSAGE' : 'OBJECT.EDIT.ADD_MESSAGE';
		const _saveMessage = this.translate.instant(saveMessageTranslateParam, { name: this._name });
		const dialogRef2 = this.dialog.open(PhiSoLieuEditDialogComponent, { data: { _item, allowEdit } });
		dialogRef2.afterClosed().subscribe(res => {
			if (!res) {
			} else {
				this.layoutUtilsService.showInfo(_saveMessage);
				return;
			}
		});
	}

	/** ACTIONS */
	prepareData(): any {
		const controls = this.itemForm.controls;
		const _item = new FormMauSoLieuDetailModel();
		_item.clear();
		_item.Id_Detail = this.item.Id_Detail;
		_item.IdSoLieu = controls.SoLieu.value;
		_item.SoLieu = this.titleSoLieu;
		_item.Detail = this.soLieuisSelected.Detail;
		_item.LoaiSoLieu = this.titleLoaiSoLieu;
		if (this.listSoLieuChild.length > 0) {
			for (const sl of this.listSoLieuChild) {
				sl.Id_Detail = this.item.Id_Detail;
				_item.SoLieuCon.push(sl);
			}
		}
		for (const sl of this.item.SoLieuCon) {
			_item.SoLieuCon.push(sl);
		}
		return _item;
	}


	DeleteDetailCon(dec: any, i: number, pos: number) {
		if (dec.Id_Detail_child > 0) {
			const _name1 = 'phí số liệu';
			const _title = this.translate.instant('OBJECT.DELETE.TITLE', { name: _name1.toLowerCase() });
			const _description = this.translate.instant('OBJECT.DELETE.DESCRIPTION', { name: _name1.toLowerCase() });
			const _waitDesciption = this.translate.instant('OBJECT.DELETE.WAIT_DESCRIPTION', { name: _name1.toLowerCase() });

			const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
			dialogRef.afterClosed().subscribe(res => {
				if (!res) {
					return;
				}
				this.xoa1(dec.Id_Detail_child, i, pos);
			});
		} else {
			this.item.SoLieuCon[i].Detail.splice(pos, 1);
		}
	}

	xoa1(Id_Detail_child, i, pos, Force: boolean = false) {
		const _name1 = 'phí số liệu';
		const _deleteMessage = this.translate.instant('OBJECT.DELETE.MESSAGE', { name: _name1 });
		this.objectService.deleteDetailChild(Id_Detail_child, Force).subscribe(res => {
			if (res && res.status === 1) {
				this.layoutUtilsService.showInfo(_deleteMessage);
				this.item.SoLieuCon[i].Detail.splice(pos, 1);
			} else {
				if (res.error.allowForce) {
					const dialogRef = this.layoutUtilsService.deleteElement("Cảnh báo", res.error.message, 'Yêu cầu đang được xử lý');
					dialogRef.afterClosed().subscribe(res => {
						if (!res) {
							return;
						}
						this.xoa1(Id_Detail_child, i, pos, true);
					});

				} else
					this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	DeleteSoLieuCon(sl: any, i: number) {
		const _name1 = 'số liệu bổ sung';
		const _title = this.translate.instant('OBJECT.DELETE.TITLE', { name: _name1.toLowerCase() });
		const _description = this.translate.instant('OBJECT.DELETE.DESCRIPTION', { name: _name1.toLowerCase() });
		const _waitDesciption = this.translate.instant('OBJECT.DELETE.WAIT_DESCRIPTION', { name: _name1.toLowerCase() });

		if (this.item.Id_Detail > 0) {
			const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
			dialogRef.afterClosed().subscribe(res => {
				if (!res) {
					return;
				}
				this.xoa(sl.Id_Detail, i);
			});
		} else {
			this.item.SoLieuCon.splice(i, 1);
		}
	}

	xoa(Id_Detail, i: number, force: boolean = false) {
		const _name1 = 'số liệu bổ sung';
		const _deleteMessage = this.translate.instant('OBJECT.DELETE.MESSAGE', { name: _name1 });
		this.objectService.DeleteDetail(Id_Detail).subscribe(res => {
			if (res && res.status === 1) {
				this.layoutUtilsService.showInfo(_deleteMessage);
				this.item.SoLieuCon.splice(i, 1);
			} else {
				if (res.error.allowForce) {
					const dialogRef = this.layoutUtilsService.deleteElement("Cảnh báo", res.error.message, 'Yêu cầu đang được xử lý');
					dialogRef.afterClosed().subscribe(res => {
						if (!res) {
							return;
						}
						this.xoa(Id_Detail, i, true);
					});

				} else
					this.layoutUtilsService.showError(res.error.message);
			}

		});
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

		if (this.idMauSoLieu > 0) {
			if (this.item.Id_Detail > 0) {
			} else {
				const object = this.prepareData();
				this.CreateMauSoLieuDetail(this.idMauSoLieu, object, withBack);
			}
		} else {
			if (this.item.Id_Detail > 0) {
				//update mẫu số liệu chi tiết
				this.dialogRef.close({ });

			} else {
				const object = this.prepareData();

				if (object.IdSoLieu == 0) {
					this.hasFormErrors = true;
					return;
				} else {
					this.Create(object, withBack);
				}
			}

		}
	}

	CreateMauSoLieuDetail(idMauSoLieu: number, object: FormMauSoLieuDetailModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.objectService.CreateDetail(idMauSoLieu, object).subscribe(res => {
			this.disabledBtn = false;
			this.viewLoading = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				this.listDetail.push(object);
				if (withBack == true) {
					this.dialogRef.close({object});
				} else {
					const _messageType = this.translate.instant('OBJECT.EDIT.ADD_MESSAGE', { name: this._name });
					this.layoutUtilsService.showInfo(_messageType).afterDismissed().subscribe(tt => { });
					this.ngOnInit();
				}
			} else {
				if (res.error.allowForce) {
					const dialogRef = this.layoutUtilsService.deleteElement("Cảnh báo", res.error.message, 'Yêu cầu đang được xử lý');
					dialogRef.afterClosed().subscribe(res => {
						if (!res) {
							return;
						}
						let object1: any = Object.assign({}, object)
						object1.Force = true;
						this.CreateMauSoLieuDetail(idMauSoLieu, object1, withBack);
					});

				} else
					this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	Create(object: FormMauSoLieuDetailModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		const check = false;
		if (this.allowCreate == true) {
			this.listDetail.push(object);
		}
		if (withBack == true) {
			this.dialogRef.close({
			});

		} else {
			this.disabledBtn = false;
			this.ngOnInit();
		}
	}

	getListSoLieuTruocDo(): any[] {
		const tempListSoLieu: any[] = [];
		for (const soLieu of this.listDetail) {
			let sl: any = { id: 0 };
			sl.id = soLieu.IdSoLieu;
			tempListSoLieu.push(sl);
		}
		return tempListSoLieu;
	}

	loadListSoLieu() {
		this.commonService.liteSoLieuParentIsNull().subscribe(res => {
			this.listSoLieu.next(res.data);
			this.listOpt = res.data;
			this.tempListSoLieu = this.getListSoLieuTruocDo();
			// không hiển thị số liệu đã được chọn
			this.tempListSoLieu.forEach(ele => {
				this.listOpt = this.listOpt.filter(item => item.id !== ele.id);
			})
		});
	}

	loadListCachNhap() {
		this.commonService.liteCachNhap().subscribe(res => {
			this.listCachNhap = res.data;
			this.changeDetectorRefs.detectChanges()
		});
	}

	filter() {
		if (!this.listOpt) {
			return;
		}
		let search = this.FilterCtrl;
		if (!search) {
			this.listSoLieu.next(this.listOpt.slice());
			return;
		} else {
			search = search.toLowerCase();
		}
		this.listSoLieu.next(
			this.listOpt.filter(ts =>
				ts.title.toLowerCase().indexOf(search) > -1)
		);
		this.changeDetectorRefs.detectChanges();
	}

	DeletePhiSoLieuIsSelected(soLieuisSelected, dec, pos) {
		if (this.item.Id_Detail > 0) {
			const _name1 = 'phí số liệu';
			const _title = this.translate.instant('OBJECT.DELETE.TITLE', { name: _name1.toLowerCase() });
			const _description = this.translate.instant('OBJECT.DELETE.DESCRIPTION', { name: _name1.toLowerCase() });
			const _waitDesciption = this.translate.instant('OBJECT.DELETE.WAIT_DESCRIPTION', { name: _name1.toLowerCase() });

			const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
			dialogRef.afterClosed().subscribe(res => {
				if (!res) {
					return;
				}
				this.xoa2(soLieuisSelected, dec, pos);
			});
		} else {
			soLieuisSelected.Detail.splice(pos, 1);
		}
	}

	xoa2(soLieuisSelected, dec, pos, force: boolean = false) {
		const _name1 = 'phí số liệu';
		const _deleteMessage = this.translate.instant('OBJECT.DELETE.MESSAGE', { name: _name1 });

		this.objectService.deleteDetailChild(dec.Id_Detail_child, force).subscribe(res => {
			if (res && res.status === 1) {
				soLieuisSelected.Detail.splice(pos, 1);
				this.layoutUtilsService.showInfo(_deleteMessage);
			} else {
				if (res.error.allowForce) {
					const dialogRef = this.layoutUtilsService.deleteElement("Cảnh báo", res.error.message, 'Yêu cầu đang được xử lý');
					dialogRef.afterClosed().subscribe(res => {
						if (!res) {
							return;
						}
						this.xoa2(soLieuisSelected, dec, pos, true);
					});

				} else
					this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	getStrCachNhap(cachnhap: any): string {
		for (const cn of this.listCachNhap) {
			if (cn.id == +cachnhap) {
				return cn.title;
			}
		}
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}
	close() {
		this.dialogRef.close();
	}

	DeletePhiSoLieu(sl: any, pos: number) {
		sl.Detail.splice(pos, 1);
	}
}
