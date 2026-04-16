// Angular
import { Component, OnInit, Inject, HostListener, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSort, MatTableDataSource } from '@angular/material';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';
// Service
import { NhapSoLieuChild, NhapSoLieuDetail } from './../Model/nhap-so-lieu.model';
import { MauSoLieuService } from './../../mau-so-lieu/Services/mau-so-lieu.service';
import { NhapSoLieuService } from '../Services/nhap-so-lieu.service';
import { FromBodyModel } from '../Model/nhap-so-lieu.model';

@Component({
	selector: 'kt-nhap-so-lieu-edit-dialog',
	templateUrl: './nhap-so-lieu-edit-dialog.component.html',
})

export class NhapSoLieuEditDialogComponent implements OnInit {

	item: any;
	oldItem: any;
	itemForm: FormGroup;
	hasFormErrors = false;
	viewLoading = false;
	listDetail: any[] = [];
	listNhapSoLieuDetail: any[] = [];
	listNhapSoLieuDetailChild: any[] = [];
	selectedDonVi: any;
	selected: any[] = [];
	datasource: MatTableDataSource<any>;
	oldListDonVi: any[] = [];
	loadingAfterSubmit = false;
	disabledBtn = false;
	listMauSoLieu: any[] = [];
	listCachNhap: any[] = [];
	allowEdit = false; // cho phép sửa
	allowDetail = false;
	isZoomSize = false;
	mauSoLieuEdit: any = [];
	isSelected: boolean = false;
	showListNhapGiaTri: boolean = false;
	isCreateForm: boolean = false;
	mauSoLieuSelected: any;
	newNhapSoLieu: boolean = false;
	duyetSoLieu: boolean = false;
	@ViewChild('focusInput', { static: true }) focusInput: ElementRef;
	@ViewChild('sort1', { static: true }) sort: MatSort;

	_name = '';

	/* Keyboard Shortcut Keys */
	@HostListener('document:keydown', ['$event'])
	onKeydownHandler(event: KeyboardEvent) {
		if (event.ctrlKey && event.keyCode == 13) { //phím Enter
			this.onSubmit(true);
		}
	}

	constructor(public dialogRef: MatDialogRef<NhapSoLieuEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialog: MatDialog,
		public commonService: CommonService,
		private objectService: NhapSoLieuService,
		private mauSoLieuService: MauSoLieuService,
		private changeDetectorRefs: ChangeDetectorRef,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService) {
			this._name = this.translate.instant('PHI_SO_LIEU.NAME');
	}

	/** LOAD DATA */
	ngOnInit() {
		this.item = this.data._item;
		this.allowEdit = this.data.allowEdit;
		this.newNhapSoLieu = this.data.newNhapSoLieu == undefined ? false : this.data.newNhapSoLieu;
		this.duyetSoLieu = this.data.duyetSoLieu;
		// if (this.item.Id_MauSoLieu > 0) 
		// 	this.mauSoLieuSelected = { //ko map
		// 		Id_MauSoLieu: this.item.Id_MauSoLieu,
		// 		Id_MauSoLieu_DonVi: this.item.Id_MauSoLieu_DonVi,
		// 		Locked: false,
		// 		MauSoLieu: this.item.MauSoLieu,
		// 		MoTa: "",
		// 		Nam: this.item.Nam,
		// 		ThoiGian: "",
		// 	};

		this.loadListCachNhap();
		if (this.duyetSoLieu == true) {
			this.objectService.getListMauSoLieu().subscribe(res => {
				this.viewLoading = false;
				if (res && res.status == 1) {
					this.listMauSoLieu = res.data;
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
				this.changeDetectorRefs.detectChanges();
			});

			if (this.item.Id_MauSoLieu > 0) {
				this.objectService.getListMauSoLieuDetailByIdMauSoLieu(this.item.Id_MauSoLieu, this.item.Nam, this.item.Id_DonVi).subscribe(res => {
					this.viewLoading = false;
					if (res && res.status == 1) {
						this.listDetail = res.data;
						this.mauSoLieuEdit = res.data[0] == undefined ?
							this.listMauSoLieu.find(msl => msl.Id_MauSoLieu == this.item.Id_MauSoLieu) :
							res.data[0].MauSoLieu[0];
						this.listDetail = this.createNhapSoLieu(this.listDetail);

						//trường hợp create nhập số liệu
						if (this.newNhapSoLieu) {
							this.initNhapSL();
						}
						this.isCreateForm = true;
					} else {
						this.layoutUtilsService.showError(res.error.message);
					}
					this.changeDetectorRefs.detectChanges();
				});

			} else {
				this.listDetail = [];
			}

		} else {
			this.objectService.getListMauSoLieu().subscribe(res => {
				this.viewLoading = false;
				if (res && res.status == 1) {
					this.listMauSoLieu = res.data;
					// if (this.listMauSoLieu.length == 0)
					// 	this.layoutUtilsService.showInfo("Không tồn tại mẫu số liệu cần nhập");
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
				this.changeDetectorRefs.detectChanges();
			});

			if (this.item.Id_MauSoLieu > 0) {
				this.objectService.getListMauSoLieuDetailByIdMauSoLieu(this.item.Id_MauSoLieu, this.item.Nam).subscribe(res => {
					this.viewLoading = false;
					if (res && res.status == 1) {
						this.listDetail = res.data;
						this.mauSoLieuEdit = res.data[0] == undefined ?
							this.listMauSoLieu.find(msl => msl.Id_MauSoLieu == this.item.Id_MauSoLieu) :
							res.data[0].MauSoLieu[0];
						this.listDetail = this.createNhapSoLieu(this.listDetail);
						
						//trường hợp create nhập số liệu
						if (this.newNhapSoLieu) {
							this.initNhapSL();
						}
						this.isCreateForm = true;
					} else {
						this.layoutUtilsService.showError(res.error.message);
					}
					this.changeDetectorRefs.detectChanges();
				});

			} else {
				this.listDetail = [];
			}
		}

	}

	loadListCachNhap() {
		this.commonService.liteCachNhap().subscribe(res => {
			this.listCachNhap = res.data;
			this.changeDetectorRefs.detectChanges()
		});
	}

	initNhapSL() {
		for (const object of this.listDetail) {
			if (object.NhapSoLieu == undefined) {
				let nhapSoLieu1: any = {};
				nhapSoLieu1.Value = '';
				object.NhapSoLieu = nhapSoLieu1;
			}
			for (const dec of object.Detail) {
				if (dec.NhapSoLieu == undefined) {
					let nhapSoLieu3: any = {};
					nhapSoLieu3.Value = '';
					dec.NhapSoLieu = nhapSoLieu3;
				}
			}
			//số liệu con
			for (const de of object.SoLieuCon) {
				if (de.NhapSoLieu == undefined) {
					let nhapSoLieu2: any = {};
					nhapSoLieu2.Value = '';
					de.NhapSoLieu = nhapSoLieu2;
				}
				for (const dec of de.Detail) {
					if (dec.NhapSoLieu == undefined) {
						let nhapSoLieu3: any = {};
						nhapSoLieu3.Value = '';
						dec.NhapSoLieu = nhapSoLieu3;
					}
				}
			}
		}
	}

	/** ACTIONS */
	prepareData(): FromBodyModel {
		const _item = new FromBodyModel();
		_item.NhapSoLieuModel = this.item;
		if (!this.newNhapSoLieu && !this.mauSoLieuSelected) {
			_item.NhapSoLieuModel.Id_MauSoLieu_DonVi = this.item.Id_MauSoLieu_DonVi;
		} else if (this.mauSoLieuSelected) {
			_item.NhapSoLieuModel.Id_MauSoLieu_DonVi = this.mauSoLieuSelected.Id_MauSoLieu_DonVi;
		}
		if (_item.NhapSoLieuModel.Id > 0) {
			// trường hợp update
			for (let object of this.listDetail) {
				if (object.NhapSoLieu.Id == null || object.NhapSoLieu.Id == undefined) {
					let item = new NhapSoLieuDetail();
					item.clear();
					item.Id = 0;
					item.Id_NhapSoLieu = _item.NhapSoLieuModel.Id;
					item.Id_Detail = object.Id_Detail;
					item.Value = object.NhapSoLieu.Value == null ? 0 : +object.NhapSoLieu.Value;
					item.Note = object.NhapSoLieu.Note == null ? "" : object.NhapSoLieu.Note;
					_item.ListNhapSoLieuDetail.push(item);
				} else {
					let item = new NhapSoLieuDetail();
					item.clear();
					item.Id = +object.NhapSoLieu.Id;
					item.Id_NhapSoLieu = +object.NhapSoLieu.Id_NhapSoLieu;
					item.Id_Detail = +object.NhapSoLieu.Id_Detail;
					item.Value = +object.NhapSoLieu.Value;
					item.Note = object.NhapSoLieu.Note;
					_item.ListNhapSoLieuDetail.push(item);
				}
				for (let dec of object.Detail) {
					if (dec.NhapSoLieu.Id == null || dec.NhapSoLieu.Id == undefined) {
						let item = new NhapSoLieuChild();
						item.clear();
						item.Id = 0;
						item.Id_Detail_Child = dec.Id_Detail_child;
						item.Id_Detail = dec.Id_Detail;
						item.Value = dec.NhapSoLieu.Value == null ? 0 : +dec.NhapSoLieu.Value;
						item.Note = dec.NhapSoLieu.Note == null ? "" : dec.NhapSoLieu.Note;
						_item.ListNhapSoLieuChild.push(item);
					} else {
						let item = new NhapSoLieuChild();
						item.clear();
						item.Id = +dec.NhapSoLieu.Id;
						item.Id_Detail_Child = +dec.NhapSoLieu.Id_Detail_Child;
						item.Id_Detail = +dec.NhapSoLieu.Id_Detail;
						item.Value = +dec.NhapSoLieu.Value;
						item.Note = dec.NhapSoLieu.Note;
						_item.ListNhapSoLieuChild.push(item);
					}
				}
				for (let de of object.SoLieuCon) {
					if (de.NhapSoLieu.Id == null || de.NhapSoLieu.Id == undefined) {
						let item = new NhapSoLieuDetail();
						item.clear();
						item.Id = 0;
						item.Id_NhapSoLieu = _item.NhapSoLieuModel.Id;
						item.Id_Detail = de.Id_Detail;
						item.Value = de.NhapSoLieu.Value == null ? 0 : +de.NhapSoLieu.Value;
						item.Note = de.NhapSoLieu.Note == null ? "" : de.NhapSoLieu.Note;
						_item.ListNhapSoLieuDetail.push(item);
					} else {
						let item = new NhapSoLieuDetail();
						item.clear();
						item.Id = +de.NhapSoLieu.Id;
						item.Id_NhapSoLieu = +de.NhapSoLieu.Id_NhapSoLieu;
						item.Id_Detail = +de.NhapSoLieu.Id_Detail;
						item.Value = +de.NhapSoLieu.Value;
						item.Note = de.NhapSoLieu.Note;
						_item.ListNhapSoLieuDetail.push(item);
					}
					for (let dec of de.Detail) {
						if (dec.NhapSoLieu.Id == null || dec.NhapSoLieu.Id == undefined) {
							let item = new NhapSoLieuChild();
							item.clear();
							item.Id = 0;
							item.Id_Detail_Child = dec.Id_Detail_child;
							item.Id_Detail = dec.Id_Detail;
							item.Value = dec.NhapSoLieu.Value == null ? 0 : +dec.NhapSoLieu.Value;
							item.Note = dec.NhapSoLieu.Note == null ? "" : dec.NhapSoLieu.Note;
							_item.ListNhapSoLieuChild.push(item);
						} else {
							let item = new NhapSoLieuChild();
							item.clear();
							item.Id = +dec.NhapSoLieu.Id;
							item.Id_Detail_Child = +dec.NhapSoLieu.Id_Detail_Child;
							item.Id_Detail = +dec.NhapSoLieu.Id_Detail;
							item.Value = +dec.NhapSoLieu.Value;
							item.Note = dec.NhapSoLieu.Note;
							_item.ListNhapSoLieuChild.push(item);
						}
					}
				}
			}
		} else {
			// trường hợp create
			for (let object of this.listDetail) {
				let item = new NhapSoLieuDetail();
				item.clear();
				item.Id = 0;
				item.Id_NhapSoLieu = 0;
				item.Id_Detail = object.Id_Detail;
				item.Value = this.newNhapSoLieu ? object.NhapSoLieu.Value : +object.NhapSoLieu.Value;
				item.Note = object.NhapSoLieu.Note;
				_item.ListNhapSoLieuDetail.push(item);

				for (let dec of object.Detail) {
					let item = new NhapSoLieuChild();
					item.clear();
					item.Id = 0;
					item.Id_Detail_Child = dec.Id_Detail_child;
					item.Id_Detail = dec.Id_Detail;
					item.Value = this.newNhapSoLieu ? object.NhapSoLieu.Value : +dec.NhapSoLieu.Value;
					item.Note = dec.NhapSoLieu.Note;
					_item.ListNhapSoLieuChild.push(item);
				}
				for (let de of object.SoLieuCon) {
					let item = new NhapSoLieuDetail();
					item.clear();
					item.Id = 0;
					item.Id_NhapSoLieu = 0;
					item.Id_Detail = de.Id_Detail;
					item.Value = this.newNhapSoLieu ? object.NhapSoLieu.Value : +de.NhapSoLieu.Value;
					item.Note = de.NhapSoLieu.Note;
					_item.ListNhapSoLieuDetail.push(item);

					for (let dec of de.Detail) {
						let item = new NhapSoLieuChild();
						item.clear();
						item.Id = 0;
						item.Id_Detail_Child = dec.Id_Detail_child;
						item.Id_Detail = dec.Id_Detail;
						item.Value = this.newNhapSoLieu ? object.NhapSoLieu.Value : +dec.NhapSoLieu.Value;
						item.Note = dec.NhapSoLieu.Note;
						_item.ListNhapSoLieuChild.push(item);
					}
				}
			}
		}
		return _item;
	}

	/** UI */
	getTitle(): string {
		let result = this.translate.instant('COMMON.CREATE');
		if (!this.allowEdit) {
			result = 'Xem chi tiết';
			return result;
		}
		if (this.item.Id < 1) {
			return result;
		}

		result = this.translate.instant('COMMON.UPDATE');
		return result;
	}


	onSubmit(withBack: boolean = false) {
		const EditObject = this.prepareData();

		if (EditObject.NhapSoLieuModel.Id > 0) {
			this.Update(EditObject, withBack);
		} else {
			this.Create(EditObject, withBack);
		}
	}

	createNhapSoLieu(listdetail): any[] {
		for (const object of listdetail) {
			if (object.NhapSoLieu == null || object.NhapSoLieu == undefined) {
				object.NhapSoLieu = [];
			}

			for (const dec of object.Detail) {
				if (dec.NhapSoLieu == null || dec.NhapSoLieu == undefined) {
					dec.NhapSoLieu = [];
				}
			}

			for (const de of object.SoLieuCon) {
				if (de.NhapSoLieu == null || de.NhapSoLieu == undefined) {
					de.NhapSoLieu = [];
				}
				for (const dec of de.Detail) {
					if (dec.NhapSoLieu == null || dec.NhapSoLieu == undefined) {
						dec.NhapSoLieu = [];
					}
				}
			}
		}
		return listdetail;
	}

	Update(object: any, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.objectService.UpdateData(object).subscribe(res => {

			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				if (withBack == true) {
					this.dialogRef.close({
						object
					});
				} else {
					this.ngOnInit();
					const _messageType = this.translate.instant('OBJECT.EDIT.UPDATE_MESSAGE', { name: this._name });
					this.layoutUtilsService.showInfo(_messageType).afterDismissed().subscribe(tt => { });
					this.focusInput.nativeElement.focus();
				}
			} else {
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	Create(object: any, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.objectService.CreateData(object).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				if (withBack == true) {
					this.dialogRef.close({
						object
					});
				} else {
					const _messageType = this.translate.instant('OBJECT.EDIT.ADD_MESSAGE', { name: this._name });
					this.layoutUtilsService.showInfo(_messageType).afterDismissed().subscribe(tt => { });
					this.focusInput.nativeElement.focus();
					this.ngOnInit();
				}
			} else {
				this.viewLoading = false;
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	filterMauSoLieu(mauSoLieuSelected: any) {
		this.isCreateForm = false;
		this.mauSoLieuSelected = mauSoLieuSelected;
		this.item.Id = 0;
		this.item.Id_MauSoLieu = this.mauSoLieuSelected.Id_MauSoLieu;
		this.objectService.getListMauSoLieuDetailByIdMauSoLieu(this.item.Id_MauSoLieu, mauSoLieuSelected.Nam).subscribe(res => {
			this.viewLoading = false;
			if (res && res.status == 1) {
				this.listDetail = res.data;
				if (this.listDetail.length == 0) {
					this.mauSoLieuEdit = this.mauSoLieuSelected;
				} else {
					this.mauSoLieuEdit = res.data[0].MauSoLieu[0];
				}
				for (const object of this.listDetail) {
					if (object.NhapSoLieu == undefined) {
						let nhapSoLieu1: any = {};
						nhapSoLieu1.Value = '';
						object.NhapSoLieu = nhapSoLieu1;
					}
					for (const dec of object.Detail) {
						if (dec.NhapSoLieu == undefined) {
							let nhapSoLieu3: any = {};
							nhapSoLieu3.Value = '';
							dec.NhapSoLieu = nhapSoLieu3;
						}
					}
					for (const de of object.SoLieuCon) {
						if (de.NhapSoLieu == undefined) {
							let nhapSoLieu2: any = {};
							nhapSoLieu2.Value = '';
							de.NhapSoLieu = nhapSoLieu2;
						}
						for (const dec of de.Detail) {
							if (dec.NhapSoLieu == undefined) {
								let nhapSoLieu3: any = {};
								nhapSoLieu3.Value = '';
								dec.NhapSoLieu = nhapSoLieu3;
							}
						}
					}
				}
				this.isCreateForm = true;
			} else {
				this.layoutUtilsService.showError(res.error.message);
			}
			this.changeDetectorRefs.detectChanges();
		});
	}
	closeForm() {
		this.dialogRef.close();
	}


	onAlertClose($event) {
		this.hasFormErrors = false;
	}

	close() {
		this.dialogRef.close();
	}

	getStrCachNhap(cachnhap: any): string {
		for (const cn of this.listCachNhap) {
			if (cn.id == +cachnhap) {
				return cn.title;
			}
		}
	}
	
	getStringDate(datetime: string) {
		if (datetime != null && datetime != undefined && datetime == '') {
			return datetime.slice(0, 10);
		}
		return '';
	}

	toggleMask($event, object) {
		if ($event.target.value == "")
			object.NhapSoLieu.Value = null;
	}
	xuatDanhSach(){
		this.objectService.exportChiTiet(this.item.Id_MauSoLieu, this.item.Nam, this.item.Id_DonVi).subscribe(res => {
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
			this.layoutUtilsService.showError("Xuất thống chi tiết thất bại");
		});
	}
}
