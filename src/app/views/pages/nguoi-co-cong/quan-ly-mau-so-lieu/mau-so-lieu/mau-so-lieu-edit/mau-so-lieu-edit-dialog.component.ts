import { Component, OnInit, Inject, HostListener, ViewChild, ElementRef, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonService } from '../../../services/common.service';
import { MauSoLieuService } from '../Services/mau-so-lieu.service';
import { MauSoLieuModel } from '../Model/mau-so-lieu.model';
import { FormMauSoLieuDetailModel, FromBodyData } from '../Model/detail-list.model';
import { PhiSoLieuEditDialogComponent } from '../phi-so-lieu-edit/phi-so-lieu-edit-dialog.component';
import { MauSoLieuDetailEditDialogComponent } from '../mau-so-lieu-detail-edit/mau-so-lieu-detail-edit-dialog.component';
import moment from 'moment';

@Component({
	selector: 'kt-mau-so-lieu-edit-dialog',
	templateUrl: './mau-so-lieu-edit-dialog.component.html',
})
export class MauSoLieuEditDialogComponent implements OnInit, OnDestroy {
	private destroy$ = new Subject<void>();
	item: MauSoLieuModel = new MauSoLieuModel();
	oldItem: any;
	oldItemV: any;
	itemForm: FormGroup = new FormGroup({});
	hasFormErrors = false;
	viewLoading = false;
	listDetail: any[] = [];
	listCachNhap: any[] = [];
	selected: any[] = [];
	datasource: MatTableDataSource<any> = new MatTableDataSource<any>();
	loadingAfterSubmit = false;
	disabledBtn = false;
	allowEdit = false; // cho phép sửa
	allowDetail = false;
	IsMauTheoPhong = false;
	lstVer: any[] = [];
	phienban: number = 0;
	@ViewChild('focusInput', { static: true }) focusInput: ElementRef | undefined;
	_name: string = '';
	tsSeparator: string = '';

	/* Keyboard Shortcut Keys */
	@HostListener('document:keydown', ['$event'])
	onKeydownHandler(event: KeyboardEvent) {
		// lưu đóng
		if (event.altKey && event.key === 'Enter') { 
			this.onSubmit(true);
		}
		//lưu tiếp tục
		if (event.ctrlKey && event.key === 'Enter') {
			this.onSubmit(false);
		}
	}

	constructor(public dialogRef: MatDialogRef<MauSoLieuEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialog: MatDialog,
		private fb: FormBuilder,
		public commonService: CommonService,
		public objectService: MauSoLieuService,
		private changeDetectorRefs: ChangeDetectorRef,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService) {
			this._name = this.translate.instant('MAU_SO_LIEU.NAME');
	}

	ngOnInit() {
		this.tsSeparator = this.commonService.thousandSeparator;
		this.item = this.data._item;
		this.loadListSoLieu();
		this.loadListCachNhap()
		if (this.data.IsMauTheoPhong != undefined)
			this.IsMauTheoPhong = this.data.IsMauTheoPhong;
		this.oldItem = Object.assign({}, this.item);
		this.allowEdit = this.data.allowEdit;
		if (this.item.Id > 0) {
			this.viewLoading = true;
			this.loadListDetail();
		} else {
			if (this.data._item.Details != undefined)
				this.listDetail = this.data._item.Details;
		}
		this.createForm();
	}

	ngOnDestroy() {
		this.destroy$.next();
		this.destroy$.complete();
	}

	changeVer() {
		if (this.phienban == 0) {
			this.loadListDetail(); //load lại detail
		}
		else {
			let f = this.lstVer.find(x => x.id == this.phienban);
			this.oldItemV = Object.assign({}, f.data);
			this.objectService.getListMauSoLieuDetailByIdMauSoLieu(this.phienban).pipe(takeUntil(this.destroy$)).subscribe(res => {
				this.viewLoading = false;
				if (res && res.status == 1) {
					this.listDetail = res.data;
					this.oldItemV.Details = res.data.map((x: any) => Object.assign({}, x));
					this.createForm();
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
			});
		}
		this.changeDetectorRefs.detectChanges();
	}

	loadListDetail() {
		this.objectService.getListMauSoLieuDetailByIdMauSoLieu(this.oldItem.Id).pipe(takeUntil(this.destroy$)).subscribe(res => {
			this.viewLoading = false;
			if (res && res.status == 1) {
				this.lstVer = res.dataExtra;
				this.listDetail = res.data;
				this.oldItem.Details = res.data.map((x: any) => Object.assign({}, x));
				this.createForm();
			} else {
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	loadListCachNhap() {
		this.commonService.liteCachNhap().pipe(takeUntil(this.destroy$)).subscribe(res => {
			this.listCachNhap = res.data;
			this.changeDetectorRefs.detectChanges()
		});
	}

	listOpt: any[] = [];
	listSoLieu: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
	tempListSoLieu: any[] = [];
	loadListSoLieu() {
		this.commonService.liteSoLieuParentIsNull().pipe(takeUntil(this.destroy$)).subscribe(res => {
			this.listSoLieu.next(res.data);
			this.listOpt = res.data;
			this.tempListSoLieu = this.getListSoLieuTruocDo();
			// không hiển thị số liệu đã được chọn
			this.tempListSoLieu.forEach(ele => {
				this.listOpt = this.listOpt.filter(item => item.id !== ele.id);
			})
		});
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

	FilterCtrl: string = '';
	filterSoLieu: number = 0;
	titleLoaiSoLieu = '';
	titleSoLieu = '';
	listSoLieuChild: any = [];
	soLieuisSelected: any = {};

	getLoaiSoLieu(filterSoLieu: number) {
		this.listSoLieuChild = [];
		let soLieu: any = [];
		this.objectService.getSoLieu(filterSoLieu).pipe(takeUntil(this.destroy$)).subscribe(data => {
			soLieu = data.data;
			this.soLieuisSelected = soLieu;
			this.soLieuisSelected.Detail = [];
			this.titleSoLieu = data.data.SoLieu;
			this.titleLoaiSoLieu = data.data.LoaiSoLieu;
			for (const sl of soLieu.SoLieuChild) {
				sl.Detail = [];
				sl.Detail.Id_Detail = 0;
				this.listSoLieuChild.push(sl);
			}
		});
	}

	filter() {
		if (!this.listOpt) return;
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

	addNhapSoLieu(_item: any, allowEdit = true, edit = false) {
		let saveMessageTranslateParam = _item.IdSoLieu > 0 ? 'OBJECT.EDIT.UPDATE_MESSAGE' : 'OBJECT.EDIT.ADD_MESSAGE';
		const _saveMessage = this.translate.instant(saveMessageTranslateParam, { name: this._name });
		const dialogRef2 = this.dialog.open(PhiSoLieuEditDialogComponent, { data: { _item, allowEdit } });
		dialogRef2.afterClosed().subscribe(res => {
			if (res) {
				if (edit) 
					this.changeVer();
				this.layoutUtilsService.showInfo(_saveMessage);
				return;
			}
		});
	}

	prepareDataCT(): any {
		const controls = this.itemForm.controls;
		const _item = new FormMauSoLieuDetailModel();
		_item.clear();
		_item.Id_Detail = 0;
		_item.IdSoLieu = controls.SoLieu.value;
		_item.SoLieu = this.titleSoLieu;
		_item.Detail = this.soLieuisSelected.Detail;
		_item.LoaiSoLieu = this.titleLoaiSoLieu;
		if (this.listSoLieuChild.length > 0) {
			for (const sl of this.listSoLieuChild) {
				sl.Id_Detail = 0;
				_item.SoLieuCon.push(sl);
			}
		}
		return _item;
	}

	async themVao() {
		let object = this.prepareDataCT();
		if(this.item.Id > 0) { //đang sửa mẫu số liệu
			await this.CreateMauSoLieuDetail(this.item.Id, object);
			this.changeVer();
		}
		else {
			this.listDetail.push(object);
		}
		this.filterSoLieu = 0;
		this.titleLoaiSoLieu = "";
		this.layoutUtilsService.showInfo("Thêm vào thành công !!");
		this.listSoLieuChild = [];
		this.soLieuisSelected.Detail = []
	}

	async CreateMauSoLieuDetail(idMauSoLieu: number, object: FormMauSoLieuDetailModel) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		let res = await this.objectService.CreateDetail(idMauSoLieu, object).toPromise();
		if (res) {
			this.disabledBtn = false;
			this.viewLoading = false;
			this.changeDetectorRefs.detectChanges();
			if (res.status === 1) {
				this.listDetail.push(object);
			} else {
				if (res.error.allowForce) {
					const dialogRef = this.layoutUtilsService.deleteElement("Cảnh báo", res.error.message, 'Yêu cầu đang được xử lý');
					dialogRef.afterClosed().subscribe(res => {
						if (!res) return;
						
						let object1: any = Object.assign({}, object)
						object1.Force = true;
						this.CreateMauSoLieuDetail(idMauSoLieu, object1);
					});

				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
			}
		};
	}

	DeletePhiSoLieu(sl: any, pos: number) {
		sl.Detail.splice(pos, 1);
	}

	DeletePhiSoLieuIsSelected(soLieuisSelected: any, dec: any, pos: number) {
		if (soLieuisSelected.Id_Detail > 0) {
			const _name1 = 'phí số liệu';
			const _title = this.translate.instant('OBJECT.DELETE.TITLE', { name: _name1.toLowerCase() });
			const _description = this.translate.instant('OBJECT.DELETE.DESCRIPTION', { name: _name1.toLowerCase() });
			const _waitDesciption = this.translate.instant('OBJECT.DELETE.WAIT_DESCRIPTION', { name: _name1.toLowerCase() });
			const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
			dialogRef.afterClosed().subscribe(res => {
				if (res) 
					this.xoa2(soLieuisSelected, dec, pos);
			});
		} else {
			soLieuisSelected.Detail.splice(pos, 1);
		}
	}

	xoa2(soLieuisSelected: any, dec: any, pos: number, force: boolean = false) {
		const _name1 = 'phí số liệu';
		const _deleteMessage = this.translate.instant('OBJECT.DELETE.MESSAGE', { name: _name1 });
		this.objectService.deleteDetailChild(dec.Id_Detail_child, force).pipe(takeUntil(this.destroy$)).subscribe(res => {
			if (res && res.status === 1) {
				soLieuisSelected.Detail.splice(pos, 1);
				this.layoutUtilsService.showInfo(_deleteMessage);
			} else {
				if (res.error.allowForce) {
					const dialogRef = this.layoutUtilsService.deleteElement("Cảnh báo", res.error.message, 'Yêu cầu đang được xử lý');
					dialogRef.afterClosed().subscribe(res => {
						if (res) 
							this.xoa2(soLieuisSelected, dec, pos, true);
					});

				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
			}
		});
	}

	DeleteSoLieuCon(sl: any, object: any, i: number) {
		const _name1 = 'số liệu con';
		const _title = this.translate.instant('OBJECT.DELETE.TITLE', { name: _name1.toLowerCase() });
		const _description = this.translate.instant('OBJECT.DELETE.DESCRIPTION', { name: _name1.toLowerCase() });
		const _waitDesciption = this.translate.instant('OBJECT.DELETE.WAIT_DESCRIPTION', { name: _name1.toLowerCase() });
		if (sl.Id_Detail > 0) {
			const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
			dialogRef.afterClosed().subscribe(res => {
				if (res) 
					this.xoa3(sl.Id_Detail, object, i);
			});
		} else {
			object.SoLieuCon.splice(i, 1);
		}
	}

	xoa3(Id_Detail: number, object: any, i: number) {
		const _name1 = 'số liệu con';
		const _deleteMessage = this.translate.instant('OBJECT.DELETE.MESSAGE', { name: _name1 });
		this.objectService.DeleteDetail(Id_Detail).pipe(takeUntil(this.destroy$)).subscribe(res => {
			if (res && res.status === 1) {
				this.layoutUtilsService.showInfo(_deleteMessage);
				object.SoLieuCon.splice(i, 1);
			} else {
				if (res.error.allowForce) {
					const dialogRef = this.layoutUtilsService.deleteElement("Cảnh báo", res.error.message, 'Yêu cầu đang được xử lý');
					dialogRef.afterClosed().subscribe(res => {
						if (res) 
							this.xoa3(Id_Detail, object, i);
					});

				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
			}
		});
	}

	createForm() {
		if (this.phienban == 0)
			this.item = Object.assign({}, this.oldItem);
		else
			this.item = Object.assign({}, this.oldItemV);
		this.itemForm = this.fb.group({
			MauSoLieu: ['' + this.item.MauSoLieu, Validators.required],
			Priority: [this.item.Priority > -1 ? this.item.Priority : ''],
			IsMauTheoPhong: [this.item.IsMauTheoPhong],
			MoTa: [this.item.MoTa === null ? '' : '' + this.item.MoTa],
			Nam: [this.item.Id == 0 ? moment().get('year') : ''],
			//trường nhập số liệu ko bật popup
			SoLieu: [''],
			LoaiSoLieu: [''],
			default: [''],
		});

		if (this.focusInput)
			this.focusInput.nativeElement.focus();
		this.itemForm.controls.LoaiSoLieu.disable();
		if (!this.allowEdit) 
			this.itemForm.disable();
	}

	prepareData(): any {
		const controls = this.itemForm.controls;
		const _item = new MauSoLieuModel();
		_item.clear();
		if (this.item.IdParent)
			_item.IdParent = this.item.IdParent;
		_item.MauSoLieu = controls.MauSoLieu.value;
		_item.Priority = controls.Priority.value > -1 ? controls.Priority.value : 1;
		_item.IsMauTheoPhong = controls.IsMauTheoPhong.value;
		_item.MoTa = controls.MoTa.value;
		_item.Nam = +controls.Nam.value;
		_item.Id = this.item.Id > 0 ? this.item.Id : 0;
		return _item;
	}

	AddNewMauSoLieuDetail() {
		const objectModel = this.item;
		this.EditObject(objectModel, this.listDetail, true, true);
	}

	getStrCachNhap(cachnhap: any): string {
		for (const cn of this.listCachNhap) {
			if (cn.id == +cachnhap) {
				return cn.title;
			}
		}
		return '';
	}

	EditObject(_item: any, _listDetail: any, allowEdit: boolean = true, allowCreate: boolean = false, idMauSoLieu: number = 0) {
		let saveMessageTranslateParam = _item.Id || _item.Id_Detail > 0 ? 'OBJECT.EDIT.UPDATE_MESSAGE' : 'OBJECT.EDIT.ADD_MESSAGE';
		const _saveMessage = this.translate.instant(saveMessageTranslateParam, { name: this._name });
		const dialogRef2 = this.dialog.open(MauSoLieuDetailEditDialogComponent, { data: { _item, idMauSoLieu, _listDetail, allowEdit, allowCreate } });
		dialogRef2.afterClosed().subscribe(res => {
			if (res) {
				if (this.item.Id > 0) {
					this.layoutUtilsService.showInfo(_saveMessage);
					this.changeVer();
				}
				return;
			}
		});
	}

	DeleteObject(object: any, index: number) {
		if (object.Id_Detail > 0) {
			const _name1 = 'Số liệu';
			const _title = this.translate.instant('OBJECT.DELETE.TITLE', { name: _name1.toLowerCase() });
			const _description = this.translate.instant('OBJECT.DELETE.DESCRIPTION', { name: _name1.toLowerCase() });
			const _waitDesciption = this.translate.instant('OBJECT.DELETE.WAIT_DESCRIPTION', { name: _name1.toLowerCase() });
			const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
			dialogRef.afterClosed().subscribe(res => {
				if (res) 
					this.xoa(object, index);
			});

		} else {
			this.listDetail.splice(index, 1);
		}
	}

	xoa(object: any, index: number) {
		const _name1 = 'Số liệu';
		const _deleteMessage = this.translate.instant('OBJECT.DELETE.MESSAGE', { name: _name1 });
		this.objectService.DeleteDetailParent(object).pipe(takeUntil(this.destroy$)).subscribe(res => {
			if (res && res.status === 1) {
				this.layoutUtilsService.showInfo(_deleteMessage);
				this.listDetail.splice(index, 1);
			} else {
				if (res.error.allowForce) {
					const dialogRef = this.layoutUtilsService.deleteElement("Cảnh báo", res.error.message, 'Yêu cầu đang được xử lý');
					dialogRef.afterClosed().subscribe(res => {
						if (!res) return;
						
						let object1 = Object.assign({}, object);
						object1.Force = true;
						this.xoa(object1, index);
					});

				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
			}
		});
	}
	
	/** UI */
	getTitle(): string {
		let result = this.translate.instant('COMMON.CREATE');
		if (!this.allowEdit) {
			result = 'Xem chi tiết';
			return result;
		}
		if (this.IsMauTheoPhong) {
			if (this.item.Id > 0)
				return this.translate.instant('MAU_SO_LIEU.updatephienban');
			else
				return this.translate.instant('MAU_SO_LIEU.addphienban');
		}
		if (this.item.Id < 1) {
			return result;
		}
		result = this.translate.instant('COMMON.UPDATE')
		return result;
	}


	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		this.loadingAfterSubmit = false;
		const controls = this.itemForm.controls;
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
		const EditObject = this.prepareData();
		if (this.listDetail.length == 0) {
			this.layoutUtilsService.showError("Mẫu số liệu bắt buộc phải có số liệu");
			return;
		}
		if (this.IsMauTheoPhong && this.phienban > 0) {
			let f = this.lstVer.find(x => x.id == this.phienban);
			if (f.title == EditObject.Nam) {
				EditObject.Id = f.id;
			}
		}
		if (EditObject.Id > 0) 
			this.Update(EditObject, withBack);
		else 
			this.Create(EditObject, this.listDetail, withBack);
	}


	Update(_item: MauSoLieuModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		let item: any = Object.assign({}, _item);
		item.Details = this.listDetail;
		let dataUp: any = { data: item };
		if (!this.IsMauTheoPhong)
			dataUp.data_old = this.oldItem;
		else
			dataUp.data_old = this.oldItemV;
		this.objectService.UpdateData(_item.Id, dataUp).pipe(takeUntil(this.destroy$)).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				if (withBack == true) {
					this.dialogRef.close({_item});
				} else {
					this.changeVer();
					const _messageType = this.translate.instant('OBJECT.EDIT.UPDATE_MESSAGE', { name: this._name });
					this.layoutUtilsService.showInfo(_messageType);
					if (this.focusInput)
						this.focusInput.nativeElement.focus();
				}
			} else {
				if (res.error.allowForce) {
					const dialogRef = this.layoutUtilsService.deleteElement("Cảnh báo", res.error.message, 'Yêu cầu đang được xử lý');
					dialogRef.afterClosed().subscribe(res => {
						if (!res) return;
						
						let object1: any = Object.assign({}, _item)
						object1.Force = true;
						this.Update(object1, withBack);
					});
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
			}
		});
	}

	Create(_item: MauSoLieuModel, listDetail: any, withBack: boolean) {
		listDetail = this.listDetail;
		const object = new FromBodyData();
		object.MauSoLieu = _item;
		object.ListFormMauSoLieuDetailModel = listDetail;
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.objectService.CreateData(object).pipe(takeUntil(this.destroy$)).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				if (withBack == true) {
					this.dialogRef.close({object});
				} else {
					const _messageType = this.translate.instant('OBJECT.EDIT.ADD_MESSAGE', { name: this._name });
					this.layoutUtilsService.showInfo(_messageType).afterDismissed().subscribe(tt => { });
					if (this.focusInput)
						this.focusInput.nativeElement.focus();
					this.ngOnInit();
				}
			} else {
				this.viewLoading = false;
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	closeForm() {
		this.dialogRef.close();
	}

	onAlertClose() {
		this.hasFormErrors = false;
	}

	close() {
		this.dialogRef.close();
	}

	taoMauMoi() {
		let _item: any = Object.assign({}, this.item);
		_item.Id = 0;
		if (this.phienban == 0)
			_item.IdParent = this.item.Id;
		else
			_item.IdParent = this.item.IdParent;
		_item.Details = [];
		for (var i = 0; i < this.listDetail.length; i++) {
			let object = this.listDetail[i];
			let temp: any = Object.assign({}, object);
			temp.Id_Detail = 0;
			temp.Detail = [];
			temp.SoLieuCon = [];
			for (var j = 0; j < object.Detail.length; j++) {
				let dec = object.Detail[j];
				let temp1 = Object.assign({}, dec);
				temp1.Id_Detail = 0;
				temp.Detail.push(temp1);
			}
			for (var j = 0; j < object.SoLieuCon.length; j++) {
				let dec = object.SoLieuCon[j];
				let temp1 = Object.assign({}, dec);
				temp1.Id_Detail = 0;
				temp1.Detail = [];
				for (var k = 0; k < dec.Detail.length; k++) {
					let dec2 = dec.Detail[k];
					let temp2 = Object.assign({}, dec2);
					temp2.Id_Detail = 0;
					temp2.Id_Detail_child = 0;
					temp1.Detail.push(temp2);
				}
				temp.SoLieuCon.push(temp1);
			}
			_item.Details.push(temp);
		}
		const dialogRef = this.dialog.open(MauSoLieuEditDialogComponent, { data: { _item, allowEdit: true, IsMauTheoPhong: true } });
		dialogRef.afterClosed().subscribe(res => {
			if (res) {
				this.layoutUtilsService.showInfo("Tạo phiên bản thành công");
				this.ngOnInit();
			}
		});
	}

	toggleMask($event: any, object: any) {
		if ($event.target.value == "")
			object.default = null;
	}

	xuatChiTiet(){
		this.objectService.exportChiTiet(this.item.Id).pipe(takeUntil(this.destroy$)).subscribe(res => {
			const headers = res.headers;
			const filename = headers.get('x-filename');
			const type = headers.get('content-type');
			const blob = new Blob([res.body], { type });
			const fileURL = URL.createObjectURL(blob);	
			const link = document.createElement('a');
			link.href = fileURL;
			link.download = filename;
			link.click();
		}, err => {
			this.layoutUtilsService.showError("Xuất chi tiết mẫu số liệu thất bại");
		});
	}

	//Khóa
	BlockWorkplace(_item: any) {
		let _description = '';
		let _waitDesciption = '';
		let _title = '';
		let islock: boolean;
		if(!_item.Locked) { 
			_description = 'Bạn có chắc chắn muốn khóa mẫu số liệu này không ??';
			_waitDesciption = 'Đang cập nhật ...';
			_title = 'Khóa mẫu số liệu';
			islock = true;
		}
		else {
			_description = 'Bạn có chắc chắn muốn mở mẫu số liệu này không ??';
			_waitDesciption = 'Đang cập nhật ...';
			_title = 'Mở khóa mẫu số liệu';
			islock = false;
		}
		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) return;
			
			this.objectService.Lock(_item.Id, islock).pipe(takeUntil(this.destroy$)).subscribe(res => {
				if (res && res.status === 1) {
					const _messageType = this.translate.instant('OBJECT.EDIT.UPDATE_MESSAGE', { name: this._name });
					this.layoutUtilsService.showInfo(_messageType);
				}
				else {
					this.layoutUtilsService.showError(res.error.message);
				}
				this.close();
			});
		});
	}

    covertToolTip(lock:boolean): string {
        switch(lock){
            case true: 
                return 'COMMON.UNBLOCK';
            case false:
                return 'COMMON.BLOCK';
        }
    }

	DeleteWorkplace(_item: MauSoLieuModel) {
		const _title = this.translate.instant('OBJECT.DELETE.TITLE', { name: this._name.toLowerCase() });
		const _description = this.translate.instant('OBJECT.DELETE.DESCRIPTION', { name: this._name.toLowerCase() });
		const _waitDesciption = this.translate.instant('OBJECT.DELETE.WAIT_DESCRIPTION', { name: this._name.toLowerCase() });
		const _deleteMessage = this.translate.instant('OBJECT.DELETE.MESSAGE', { name: this._name });
		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) return;
			
			this.objectService.deleteItem(_item.Id).pipe(takeUntil(this.destroy$)).subscribe(res => {
				if (res && res.status === 1) {
					this.layoutUtilsService.showInfo(_deleteMessage);
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
				this.close();
			});
		});
	}
}