import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, Inject, ViewChild, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator, MatSort, MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { BehaviorSubject } from 'rxjs';
import { NhapQuyTrinhDuyetDataSource } from '../Model/data-sources/nhap-quy-trinh-duyet.datasource';
import { NhapQuyTrinhDuyetService } from '../Services/nhap-quy-trinh-duyet.service';
import { NhapCapQuanLyDuyetModel } from '../Model/nhap-quy-trinh-duyet.model';
import { ChonNhieuNhanVienListComponent, ChonNhieuNhanVienListModel } from '../../../components';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';
import { CommonService } from '../../../services/common.service';

@Component({
	selector: 'm-nhap-cap-quan-ly-duyet-edit',
	templateUrl: './nhap-cap-quan-ly-duyet-edit.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class NhapCapQuanLyDuyetEditComponent implements OnInit {

	// Table fields
	loadingSubject = new BehaviorSubject<boolean>(false);
	dataSource: NhapQuyTrinhDuyetDataSource | undefined;
	displayedColumns = ['#', 'TieuDe', 'ViTri', 'CapQuanLy', 'NguoiNhanMail', 'GhiChu', 'actions'];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator | undefined;
	@ViewChild(MatSort, { static: true }) sort: MatSort | undefined;

	// Selection
	selection = new SelectionModel<NhapCapQuanLyDuyetModel>(true, []);
	productsResult: NhapCapQuanLyDuyetModel[] = [];
	// Filter fields
	//List các danh sách email
	listNguoiNhanEmail: any[] = [];
	//==========================
	itemForm: FormGroup | undefined;
	loadingControl = new BehaviorSubject<boolean>(false);
	item: NhapCapQuanLyDuyetModel;
	oldItem: NhapCapQuanLyDuyetModel;
	hasFormErrors: boolean = false;
	//==========================
	showCapQuanLyMax: boolean = false;
	showChucVu: boolean = false;
	showQuyen: boolean = false;
	showButon: boolean = false;
	showChucDanh: boolean = false;
	//==========================
	listDonVi: any[] = [];
	listPhongBan: any[] = [];
	listChucDanh: any[] = [];
	listChucDanhLite: any[] = [];
	listChucVu: any[] = [];
	listNhomQuyen: any[] = [];
	listQuyen: any[] = [];
	id_donvi: string = '';
	id_pb: string = '';
	id_cd: string = '';
	listCapDuyet: any[] = [];
	id_capduyet: string = '';
	listCapDuyetQT: any[] = [];
	listCapDuyetMax: any[] = [];
	id_capduyetmax: string = '';
	listViTri: any[] = [];
	//==========================
	idquytrinh: string = "";
	tenquytrinh: string = "";
	sudungvitri: string = "";
	showViTri: boolean = true;
	showBtViTri: boolean = false;
	//==========================
	public datatree: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
	title: string = '';
	ID_Struct: string = '';
	disabledBtn: boolean = false;
	isZoomSize: boolean = false;
	viewLoading: boolean = false;
	listIcon: any[] = [
		{ icon: "create", name: "Xác nhận" },
		{ icon: "description", name: "Xử lý" },
		{ icon: "check", name: "Duyệt" },
		{ icon: "near_me", name: "Chốt đơn hàng" },
		{ icon: "chat", name: "Kết quả thu hồi" }
	];
	allowEdit: boolean = true;

	/* Keyboard Shortcut Keys */
	@HostListener('document:keydown', ['$event'])
	onKeydownHandler(event: KeyboardEvent) {
		if (event.ctrlKey && event.keyCode == 13) { //phím Enter
			this.luuvacapnhat(true);
		}
	}

	constructor(public dialogRef: MatDialogRef<NhapCapQuanLyDuyetEditComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private nhapQuyTrinhDuyetService: NhapQuyTrinhDuyetService,
		private commonService: CommonService,
		public dialog: MatDialog,
		private itemFB: FormBuilder,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef) { }

	/** LOAD DATA */
	ngOnInit() {
		this.viewLoading = true;
		this.title = "Chọn cơ cấu tổ chức";
		this.loadingSubject.next(true);
		this.item = this.data._item;
		this.idquytrinh = this.data.idqt;
		this.tenquytrinh = this.data.tenqt;
		if (this.data.allowEdit != undefined)
			this.allowEdit = this.data.allowEdit;

		this.createForm();
		this.getTreeValue();
		this.loadListData();
		if (this.item.ID_CapQuanLy > 0) {
			this.nhapQuyTrinhDuyetService.get_ChiTietCapQuanLy(this.item.ID_CapQuanLy).subscribe(res => {
				this.viewLoading = false;
				if (res.ID_CapQuanLy == -2) {
					const message = `Lỗi! ` + res.ID_CapQuanLy;
					this.layoutUtilsService.showError(message);
					return;
				}
				this.item = res;
				if (this.item.Processmethod == '2')
					this.loadListCapBack(this.item.ID_QuyTrinh, this.item.ID_CapQuanLy, this.item.ViTri);
				this.oldItem = Object.assign({}, res);
				this.listNguoiNhanEmail = this.item.data_NguoiNhanMail;
				this.initProduct();
				this.loadChange(this.item.ID_CapDuyet + '');
				this.Update(this.item);
				this.changeDetectorRefs.detectChanges();
			});
		}
		else {
			if (this.item.Processmethod == '2')
				this.loadListCapBack(this.item.ID_QuyTrinh, this.item.ID_CapQuanLy, this.item.ViTri);
			this.viewLoading = false;
			this.oldItem = Object.assign({}, this.item);
			this.initProduct();
		}
		setTimeout(function () { 
			let id = document.getElementById('id');
			if (id) id.focus(); 
		}, 100);
	}

	getTreeValue() {
		this.commonService.Get_CoCauToChuc().subscribe(res => {
			if (res.data && res.data.length > 0) {
				this.datatree.next(res.data);
				if (+this.item.StructureID > 0) {
					this.ID_Struct = '' + this.item.StructureID;
				} else {
					this.ID_Struct = '' + res.data[0].RowID;
				}
				this.loadListChucVu();
				this.loadPermission();
				if (this.itemForm)
					this.itemForm.controls['drp'].setValue(this.ID_Struct);
				this.changeDetectorRefs.detectChanges();
			}
		});
	}

	GetValueNode(val: any) {
		this.ID_Struct = val.id;
		this.loadListChucVu();
	}

	initProduct() {
		this.createForm();
		this.loadingSubject.next(false);
		this.loadingControl.next(true);
	}

	createForm() {
		var temp: any = {};
		temp = {
			tenCapDuyet: [this.item.TenCapDuyet, [Validators.required, Validators.maxLength(200)]],
			SoNgayXuLy: [this.item.SoNgayXuLy, [Validators.required, Validators.min(1)]],
			ghiChu: [this.item.GhiChu, Validators.maxLength(500)],
			chucVu: [this.item.ID_ChucVu, Validators.required],
			chucDanh: [this.item.ID_ChucVu, Validators.required],
			drp: [this.ID_Struct],
			nhomQuyen: [this.item.Permission_CodeGroup, Validators.required],
			quyen: [this.item.Permission_Code, Validators.required],
			duyetSS: [this.item.DuyetSS]
		}
		if (this.item.ProcessmethodLoai == 1)
			temp.icon = [this.item.ID_CapQuanLy > 0 ? this.item.Icon : 'description', Validators.required];
		if (this.item.Processmethod == '2')
			temp.id_back = [this.item.ID_Back + '', Validators.required];
		this.itemForm = this.itemFB.group(temp);
		this.changeDetectorRefs.detectChanges();

		if (!this.allowEdit)
			this.itemForm.disable();
	}
	reset() {
		this.item = Object.assign({}, this.oldItem);
		this.createForm();
		this.hasFormErrors = false;
		if (!this.itemForm) return;
		this.itemForm.markAsPristine();
		this.itemForm.markAsUntouched();
		this.itemForm.updateValueAndValidity();
	}


	//============Hàm load chức vụ=================
	loadListCapBack(IdQuyTrinh: number, IdCap: number, ViTri: number) {
		this.nhapQuyTrinhDuyetService.GetListCapBack(IdQuyTrinh, IdCap, ViTri).subscribe(res => {
			if (res && res.status == 1) {
				this.listCapDuyetQT = res.data;
			}
			else {
				this.listCapDuyetQT = [];
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}
	loadListChucVu() {
		this.commonService.GetListPositionbyStructure(this.ID_Struct).subscribe(res => {
			if (res && res.status == 1) {
				this.listChucDanh = res.data;
			} else {
				this.listChucDanh = [];
				this.layoutUtilsService.showError(res.error.message);
			}
			if (this.item.ID_ChucDanh > 0)
				this.id_cd = '' + this.item.ID_ChucDanh;
			else {
				if (res.data.length > 0) {
					this.id_cd = '' + res.data[0].ID;
				} else {
					this.id_cd = '';
				}
			}
			this.commonService.GetListJobtitleByStructure(this.id_cd, this.ID_Struct).subscribe(res => {
				if (res && res.status == 1) {
					this.listChucVu = res.data;
				} else {
					this.listChucVu = [];
					this.layoutUtilsService.showError(res.error.message);
				}
				if (!this.itemForm) return;
				if (this.item.ID_ChucVu == 0) {
					if (this.id_capduyet == "-2") {
						if (res.data.length > 0) {
							this.itemForm.controls['chucVu'].setValue('' + res.data[0].ID);
						} else
							this.itemForm.controls['chucVu'].setValue('');
					}
				} else {
					this.itemForm.controls['chucVu'].setValue('' + this.item.ID_ChucVu);
				}
				this.changeDetectorRefs.detectChanges();
			});
		});
	}

	loadPermission() {
		this.nhapQuyTrinhDuyetService.GetListPermission().subscribe(res => {
			if (res && res.status == 1) {
				this.listNhomQuyen = res.data;
				this.setListQuyen(this.item.Permission_CodeGroup);
				//if (res.data.length > 0) {
				//this.itemForm.controls['nhomQuyen'].setValue('' + res.data[0].Code);
				//this.listQuyen = res.data[0].PqPermission;
				//}
			} else {
				this.listNhomQuyen = [];
				this.layoutUtilsService.showError(res.error.message);
			}
			this.changeDetectorRefs.detectChanges();
		});
	}

	setListQuyen(val: any) {
		if (!val) return;
		var find = this.listNhomQuyen.find(x => x.Code == val);
		if (find)
			this.listQuyen = find.PqPermission;
		else
			this.listQuyen = [];
		this.changeDetectorRefs.detectChanges();
	}

	loadListData() {
		this.commonService.GetListPosition().subscribe(res => {
			this.listChucDanhLite = res.data;
			if (!this.itemForm) return;
			if (res.data.length > 0) {
				if (this.item.ID_ChucVu > 0)
					this.itemForm.controls['chucDanh'].setValue('' + this.item.ID_ChucVu);
				else
					this.itemForm.controls['chucDanh'].setValue('' + res.data[0].ID);
			} else {
				this.itemForm.controls['chucDanh'].setValue('');
			}
			this.changeDetectorRefs.detectChanges();
		});
		this.nhapQuyTrinhDuyetService.GetListApprovalLevel().subscribe(res => {
			if (res && res.status == 1) {
				if (!this.item.AllowDevChecker)
					res.data.splice(0, 2);
				this.listCapDuyet = res.data;
				if (res.data.length > 0 && this.item.ID_CapDuyet == 0) {
					this.id_capduyet = '' + res.data[0].ID_Row;
					this.loadChange(this.id_capduyet);
				}
			} else {
				this.listCapDuyet = [];
				this.layoutUtilsService.showError(res.error.message);
			}
			this.changeDetectorRefs.detectChanges();
		});
		this.nhapQuyTrinhDuyetService.GetListApprovalLevel_Max().subscribe(res => {
			if (res && res.status == 1) {
				this.listCapDuyetMax = res.data;
			} else {
				this.listCapDuyetMax = [];
				this.layoutUtilsService.showError(res.error.message);
			}
			this.changeDetectorRefs.detectChanges();
		});
	}

	loadChucDanhChange(idcd: any) {
		let id_st = this.ID_Struct;
		this.commonService.GetListJobtitleByStructure(idcd, id_st).subscribe(res => {
			if (res && res.status == 1) {
				this.listChucVu = res.data;
				if (!this.itemForm) return;
				if (this.listChucVu.length > 0) 
					this.itemForm.controls['chucVu'].setValue('' + res.data[0].ID);
				else 
					this.itemForm.controls['chucVu'].setValue('');
			} else {
				this.listChucVu = [];
				this.layoutUtilsService.showError(res.error.message);
			}
			this.changeDetectorRefs.detectChanges();
		});
	}

	loadChange(val: any) {
		if (!this.itemForm) return;
		this.itemForm.controls['chucVu'].setValue(" ");
		this.itemForm.controls['chucDanh'].setValue(" ");
		this.itemForm.controls["quyen"].setValue(" ");
		this.itemForm.controls["nhomQuyen"].setValue(" ");
		this.showChucDanh = false;
		this.showCapQuanLyMax = false;
		this.showChucVu = false;
		this.showQuyen = false;
		switch (val) {
			case ("-5"): {
				this.showChucDanh = true;
				this.itemForm.controls["chucDanh"].setValue('' + this.item.ID_ChucVu);
				break;
			};
			case ("-3"): {
				this.showQuyen = true;
				this.itemForm.controls["quyen"].setValue(this.item.Permission_CodeGroup);
				this.itemForm.controls["nhomQuyen"].setValue(this.item.Permission_Code);
				break;
			};
			case ("-2"): {
				this.showChucVu = true;
				this.itemForm.controls["chucVu"].setValue('' + this.item.ID_ChucVu);
				break;
			};
			case ("-1"):
			case ("0"): {
				this.showCapQuanLyMax = true;
				break;
			};
			default: {
				break;
			}
		}
	}

	//Hàm kiêm tra===================================
	text(e: any, vi: any) {
		if (!((e.keyCode > 95 && e.keyCode < 106)
			|| (e.keyCode > 45 && e.keyCode < 58)
			|| e.keyCode == 8)) {
			e.preventDefault();
		}
	}
	//===Tiêu đề hiển thị==================================================
	getComponentTitle() {
		let result = '';
		if (!this.allowEdit)
			result = 'Xem chi tiết bước duyệt';
		else {
			if (this.item.ID_CapQuanLy > 0)
				result = 'Cập nhật bước duyệt';
			else result = 'Thêm mới bước duyệt';
		}
		return result;
	}
	//=======================================================================
	//Xử lý chọn cán bộ gửi email==========================================
	themnguoinhanemail() {
		const dialogRef = this.dialog.open(ChonNhieuNhanVienListComponent, {
			data: { },
			disableClose: false
		});
		dialogRef.afterClosed().subscribe(res => {
			if (res && res.done) {
				if (this.listNguoiNhanEmail.length > 0) {
					res.nhanVienSelected.map((item: any) => {
						let ktc = this.listNguoiNhanEmail.find(x => x.ID_NV == item.ID_NV);
						if (!ktc) {
							let kdd = new ChonNhieuNhanVienListModel;
							kdd.ID_NV = item.ID_NV;
							kdd.HoTen = item.HoTen;
							this.listNguoiNhanEmail.push(kdd);
						}
					});
				}
				else {
					this.listNguoiNhanEmail = res.nhanVienSelected;
				}
				this.changeDetectorRefs.detectChanges();
			}
		});
	}

	removethemnguoinhanemail(item: any): void {
		const index = this.listNguoiNhanEmail.indexOf(item);
		if (index >= 0) {
			this.listNguoiNhanEmail.splice(index, 1);
			this.changeDetectorRefs.detectChanges();
		}
	}
	//===Button xóa trên lưới===========
	deleteItem(row: any) {
		const _title = "Xóa";
		const _description = "Bạn có chắc muốn xóa không";
		const _waitDesciption = "Dữ liệu đang được xóa";
		const _deleteMessage = "Xóa thành công";
		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) return;
			
			this.nhapQuyTrinhDuyetService.deleteCapQuanLy(row.ID_CapQuanLy, this.tenquytrinh, row.TenCapDuyet).subscribe(res => {
				if (res && res.status === 1) {
					this.layoutUtilsService.showError(_deleteMessage);
				}
				else {
					this.layoutUtilsService.showError(res.error.message);
				}
			});
		});
	}
	//====================================================================================
	trolai() {
		this.dialogRef.close();
	}

	Update(row: any) {
		this.item.ID_CapQuanLy = row.ID_CapQuanLy;
		this.id_capduyet = '' + row.ID_CapDuyet;
		if (row.ID_CapDuyet == -3) {
			this.showCapQuanLyMax = false;
			this.showChucVu = false;
			this.showQuyen = true;
			if (this.itemForm) {
				this.itemForm.controls['chucVu'].setValue(" ");
				this.itemForm.controls['nhomQuyen'].setValue(row.Permission_CodeGroup);
				this.itemForm.controls['quyen'].setValue(row.Permission_Code);
			}
			this.nhapQuyTrinhDuyetService.GetListPermission().subscribe(res => {
				if (res && res.status == 1) {
					this.listNhomQuyen = res.data;
					if (res.data.length > 0) {
						this.listQuyen = res.data[0].PqPermisstion;
					}
				} else {
					this.listNhomQuyen = [];
					this.listQuyen = [];
					this.layoutUtilsService.showError(res.error.message);
				}
				this.changeDetectorRefs.detectChanges();
			});
		}
		else {
			this.showQuyen = false;
			if (row.ID_CapDuyet == -2) {
				this.showCapQuanLyMax = false;
				this.showChucVu = true;
				this.commonService.GetListPositionbyStructure(this.ID_Struct).subscribe(res => {
					this.listChucDanh = res.data;
					if (res.data.length > 0) {
						this.id_cd = '' + row.ID_ChucDanh;
						this.commonService.GetListJobtitleByStructure(this.id_cd, this.ID_Struct).subscribe(res => {
							this.listChucVu = res.data;
							if (this.itemForm && res.data.length > 0) {
								this.itemForm.controls['chucVu'].setValue('' + row.ID_ChucVu);
							}
							this.changeDetectorRefs.detectChanges();
						});
					}
				});
			}
			else if (row.ID_CapDuyet == -1 || row.ID_CapDuyet == 0) {
				this.showCapQuanLyMax = true;
				this.showChucVu = false;
				this.id_capduyetmax = '' + row.ID_CapDuyetLonNhat;
				if (this.itemForm) 
					this.itemForm.controls['chucVu'].setValue(" ");
			}
			else {
				this.showCapQuanLyMax = false;
				this.showChucVu = false;
				if (this.itemForm) 
					this.itemForm.controls['chucVu'].setValue(" ");
			}
		}
		if (row.data_NguoiNhanMail.length > 0) {
			this.listNguoiNhanEmail = row.data_NguoiNhanMail;
			this.changeDetectorRefs.detectChanges();
		}
	}
	//===========Button lưu và cập nhật
	luuvacapnhat(withBack: boolean = false) {
		this.hasFormErrors = false;
		if (!this.itemForm) return;
		const controls = this.itemForm.controls;
		if (this.itemForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);
			this.hasFormErrors = true;
			return;
		}
		let edited = this.prepare();
		this.CreateCapQuanLy(edited, withBack);
		return;

	}
	prepare(): NhapCapQuanLyDuyetModel {
		const controls = this.itemForm.controls;
		const _item = new NhapCapQuanLyDuyetModel();
		_item.clear();
		_item.ID_CapQuanLy = this.item.ID_CapQuanLy;
		_item.ID_QuyTrinh = +this.idquytrinh;
		_item.SoNgayXuLy = +controls['SoNgayXuLy'].value;
		_item.TenQuyTrinh = this.tenquytrinh;
		_item.TenCapDuyet = controls['tenCapDuyet'].value;
		_item.ID_CapDuyet = +this.id_capduyet;
		_item.DuyetSS = controls['duyetSS'].value;
		if (this.id_capduyet == "-3") {
			_item.Permission_Code = controls['quyen'].value;
		}
		if (this.id_capduyet == "-2") {
			_item.ID_ChucVu = controls['chucVu'].value;
		}
		if (this.id_capduyet == "-5") {
			_item.ID_ChucVu = controls['chucDanh'].value;
		}
		if (this.id_capduyet == "-1" || this.id_capduyet == "0") {
			_item.ID_CapDuyetLonNhat = this.id_capduyetmax ? +this.id_capduyetmax : 0;
		}
		_item.GhiChu = controls['ghiChu'].value;
		if (this.item.ProcessmethodLoai == 1) {
			_item.Icon = controls['icon'].value;
		}
		if (this.listNguoiNhanEmail.length > 0) {
			let list1 = "";
			this.listNguoiNhanEmail.map((item) => {
				list1 += item.ID_NV + ',';
			})
			_item.ID_NguoiNhanMail = list1.substring(0, list1.length - 1);
		}
		if (this.item.Processmethod == '2') {
			_item.ID_Back = controls['id_back'].value;
		}
		return _item;
	}
	CreateCapQuanLy(item: NhapCapQuanLyDuyetModel, withBack: boolean = false) {
		this.loadingSubject.next(true);
		this.disabledBtn = true;
		this.nhapQuyTrinhDuyetService.CreateCapQuanLy(item).subscribe(res => {
			this.loadingSubject.next(false);
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				if (+this.item.ID_CapQuanLy > 0) {
					const _messageType = "Cập nhật thành công";
					this.layoutUtilsService.showInfo(_messageType);
					this.showButon = false;
				}
				else {
					const _messageType = "Thêm thành công";
					this.layoutUtilsService.showInfo(_messageType);
				}
				this.listNguoiNhanEmail = [];
				if (withBack) 
					this.dialogRef.close(item);
			}
			else {
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	onAlertClose() {
		this.hasFormErrors = false;
	}
	
	enableDuyetSS() {
		return +this.id_capduyet <= -1;
	}
}