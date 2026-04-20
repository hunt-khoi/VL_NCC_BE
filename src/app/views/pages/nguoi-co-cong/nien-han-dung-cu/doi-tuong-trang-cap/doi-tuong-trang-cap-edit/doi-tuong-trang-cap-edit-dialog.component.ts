import { Component, OnInit, Inject, ChangeDetectionStrategy, HostListener, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MatTable, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { ReplaySubject } from 'rxjs';
import { TokenStorage } from 'app/core/auth/_services/token-storage.service';
import { LayoutUtilsService, TypesUtilsService } from 'app/core/_base/crud';
import { CommonService } from '../../../services/common.service';
import { DoiTuongTrangCapService } from '../Services/doi-tuong-trang-cap.service';
import { DoiTuongTrangCapModel, DTChinhHinh_DetailDTO, DTChinhHinh_DetailModel } from '../Model/doi-tuong-trang-cap.model';

@Component({
	selector: 'kt-doi-tuong-trang-cap-edit',
	templateUrl: './doi-tuong-trang-cap-edit-dialog.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class DoiTuongTrangCapEditDialogComponent implements OnInit {

	item: DoiTuongTrangCapModel;
	oldItem: DoiTuongTrangCapModel;
	itemForm: FormGroup;
	hasFormErrors = false;
	viewLoading = false;
	loadingAfterSubmit = false;
	isZoomSize: boolean = false;
	disabledBtn = false;
	allowEdit = false;
	filterprovinces: number;
	listprovinces: any[] = [];
	filterdistrict = '';
	listdistrict: any[] = [];
	listward: any[] = [];
	filterward = '';
	listgioitinh: any[] = [];

	listDoiTuongDc: any[] =[];
	listdoituongdc: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
	listOpt_dc: any[] = [];
	listDungCuChinhHinh: any = [];
	FilterCtrl_dc: string = '';
	namhientai = (new Date()).getFullYear();

	displayedColumns = ['STT', 'tendungcu', 'namcap'];	
	listDoiTuongDC_added : DTChinhHinh_DetailDTO[] = [];
	@ViewChild(MatTable, { static: true }) table: MatTable<DTChinhHinh_DetailDTO>;

	FilterCtrl: string = '';
	listOpt: any[] = [];
	listdoituongncc: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

	FilterCtrl1: string = '';
	listOpt1: any[] = [];
	listquanhevoilietsy: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

	listKhomAp: any[] = [];
	thannhanName = '';
	quanhe: number;
	require = '';
	objectThanNhan: any;
	@ViewChild('focusInput', { static: true }) focusInput: ElementRef;
	_NAME = '';
	maxNS = moment(new Date()).add(-16, 'year').toDate();
	Id_LoaiHoSo: number;
	IsThanNhan: boolean;
	Capcocau: number;
	change: boolean = false;
	IsReturn: boolean = false;
	IsTang: boolean = false;

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
		public dialogRef: MatDialogRef<DoiTuongTrangCapEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		private commonService: CommonService,
		private objectService: DoiTuongTrangCapService,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private typesUtilsService: TypesUtilsService,
		private tokenStorage: TokenStorage,
		private translate: TranslateService) {
			this._NAME = 'Đối tượng trang cấp';
	}

	filter() {
		if (!this.listOpt_dc) {
			return;
		}
		let search = this.FilterCtrl_dc;
		if (!search) {
			this.listdoituongdc.next(this.listOpt_dc.slice());
			return;
		} else {
			search = search.toLowerCase();
		}
		this.listdoituongdc.next(
			this.listOpt_dc.filter(ts =>
				ts.title.toLowerCase().indexOf(search) > -1)
		);
		this.changeDetectorRefs.detectChanges();
	}

	filter1() {
		if (!this.listOpt1) {
			return;
		}
		let search = this.FilterCtrl1;
		if (!search) {
			this.listquanhevoilietsy.next(this.listOpt1.slice());
			return;
		} else {
			search = search.toLowerCase();
		}
		this.listquanhevoilietsy.next(
			this.listOpt1.filter(ts =>
				ts.title.toLowerCase().indexOf(search) > -1)
		);
		this.changeDetectorRefs.detectChanges();
	}

	/** LOAD DATA */
	ngOnInit() {
		this.item = this.data._item;
		if (this.data.allowEdit != undefined)
			this.allowEdit = this.data.allowEdit;
		if (this.data.IsReturn != undefined)
			this.IsReturn = this.data.IsReturn;
		if (this.data.nam != undefined) {
			this.namhientai = this.data.nam
			this.IsTang = true;
		}
		this.commonService.GetAllProvinces().subscribe(res => {
			this.listprovinces = res.data;
			this.changeDetectorRefs.detectChanges();
		});
		this.tokenStorage.getUserInfo().subscribe(res => {
			this.filterprovinces = res.IdTinh;
			this.item.ProvinceID = this.filterprovinces;
			this.loadGetListDistrictByProvinces(this.filterprovinces);
			this.Capcocau = res.Capcocau;

			if (res.Capcocau == 2) { //cấp huyện
				this.filterdistrict = res.ID_Goc_Cha;
				this.item.DistrictID = +this.filterdistrict
				this.item.Id_Xa = res.ID_Goc;
				this.filterward = '' + this.item.Id_Xa;
				if (this.item.Id == 0) {
					this.loadGetListWardByDistrict(this.filterdistrict);
					this.loadKhomAp();
				}
			}
			if (res.Capcocau == 3) { //cấp xã
				this.filterdistrict = res.ID_Goc_Cha;
				this.item.DistrictID = +this.filterdistrict
				this.item.Id_Xa = res.ID_Goc;
				this.filterward = '' + this.item.Id_Xa;
				if (this.item.Id == 0) {
					this.loadGetListWardByDistrict(this.filterdistrict);
					this.loadKhomAp();
				}
			}
		})

		this.loadListGioiTinh();
		this.loadListDoiTuongDC();
		this.loadListQuanHeGiaDinh();

		this.createForm();

		if (this.item.Id > 0) {
			this.viewLoading = true;
			this.objectService.getItem(this.item.Id).subscribe(res => {
				this.viewLoading = false;
				this.changeDetectorRefs.detectChanges();
				if (res && res.status === 1) {
					
					this.item = res.data;
					this.item.ChiTiets.forEach(ele =>{
						this.get_listDCDT(ele);
					});
					this.loadListDungCuChinhHinh();
					this.loadGetListWardByDistrict(this.item.DistrictID);
					this.filterward = '' + this.item.Id_Xa;
					this.loadKhomAp();
					this.createForm();
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
			});
		}

	}

	get_listDCDT(item){
		let dt = new DTChinhHinh_DetailDTO();
		dt.Id = item.Id;
		dt.id = item.Id_DungCu;
		dt.id_doituong = this.itemForm.controls.Id_DoiTuong.value;
		dt.NamCap = item.NamCap;
		dt.title = item.DungCu;
		this.listDoiTuongDC_added.push(dt);
		let index = this.listDungCuChinhHinh.findIndex(x => x.id === item.Id_DungCu);
		if(index != -1){
			this.listDungCuChinhHinh.splice(index,1);
		}
	}

	createForm() {
		const temp: any = {
			SoHoSo: [this.item.SoHoSo, Validators.required],
			HoTen: [this.item.HoTen, Validators.required],
			DiaChi: [this.item.DiaChi],
			NgaySinh: [this.item.NgaySinh],
			SoTheoDoi: [this.item.SoTheoDoi, Validators.required],
			GioiTinh: ['' + this.item.GioiTinh, Validators.required],
			Province: [this.item.ProvinceID, Validators.required],
			District: ['' + this.item.DistrictID, Validators.required],
			Id_Xa: ['' + this.item.Id_Xa, Validators.required],
			Id_KhomAp: [this.item.Id_KhomAp ? '' + this.item.Id_KhomAp : null, Validators.required],
			Id_DoiTuong: ['' + this.item.Id_DoiTuong, Validators.required],
			NamSinh: [this.item.NamSinh, Validators.required],
			GhiChu: [this.item.GhiChu != null ? this.item.GhiChu:''],
			HoTenThanNhan: [this.item.HoTenThanNhan != null ? this.item.HoTenThanNhan:''],
			Id_QHGiaDinh: ['' + this.item.Id_QHGiaDinh],
			DungCuChinhHinh: ['' + this.item.DungCuChinhHinh, Validators.required],
			NamCap: ['' + this.namhientai, Validators.required],

		};
		this.itemForm = this.fb.group(temp);
		this.focusInput.nativeElement.focus();

		if (!this.allowEdit) {
			this.itemForm.disable();
		}
		if (this.IsTang) { //khi thêm báo tăng ko cho sửa năm
			this.itemForm.controls.NamCap.disable();  
		}
		this.changeDetectorRefs.detectChanges();
	}

	/** UI */
	getTitle(): string {
		let result = this.translate.instant('COMMON.CREATE');
		if (!this.allowEdit) {
			result = 'Xem chi tiết';
			return result;
		}
		if (!this.item || !this.item.Id) {
			return result;
		}

		result = this.translate.instant('COMMON.UPDATE')
		return result + ` đối tượng trang cấp`;
	}


	/** ACTIONS */
	prepareCustomer(): DoiTuongTrangCapModel {
		const controls = this.itemForm.controls;
		const _item = new DoiTuongTrangCapModel();
		_item.Id = +this.item.Id;
		_item.HoTen = controls.HoTen.value;
		_item.SoHoSo = controls.SoHoSo.value;
		_item.GioiTinh = +controls.GioiTinh.value;
		_item.SoTheoDoi = controls.SoTheoDoi.value;
		_item.DiaChi = controls.DiaChi.value;
		_item.Id_Xa = +controls.Id_Xa.value;
		_item.Id_KhomAp = +controls.Id_KhomAp.value;
		_item.Id_DoiTuong = +controls.Id_DoiTuong.value;
		_item.NamSinh = +controls.NamSinh.value;

		_item.GhiChu = controls.GhiChu.value;
		_item.HoTenThanNhan = controls.HoTenThanNhan.value;
		_item.Id_QHGiaDinh = 0;
		if(controls.Id_QHGiaDinh.value != null)
			_item.Id_QHGiaDinh = +controls.Id_QHGiaDinh.value;

		let chitiets : DTChinhHinh_DetailModel[] = [];
		this.listDoiTuongDC_added.forEach((ele) =>{
			let dc = new DTChinhHinh_DetailModel();
			dc.Id = ele.Id;
			dc.Id_DungCu = ele.id;
			dc.Id_NCC = ele.Id_NCC;
			dc.NamCap = +ele.NamCap;
			chitiets.push(dc);
		});
		_item.ChiTiets = chitiets;

		if (controls.NgaySinh.value !== '')
			_item.NgaySinh = this.commonService.f_convertDate(controls.NgaySinh.value);

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
		if (controls["HoTenThanNhan"].value !== '' && controls["Id_QHGiaDinh"].value == null) {
			this.layoutUtilsService.showInfo("Vui lòng chọn mối quan hệ gia đình");
			return;
		}
		const EditDoiTuongTrangCap = this.prepareCustomer();
		if (EditDoiTuongTrangCap == null)
			return;
		if (EditDoiTuongTrangCap.Id > 0) {
			this.UpdateDoiTuongTrangCap(EditDoiTuongTrangCap, withBack);
		} else {
			this.CreateDoiTuongTrangCap(EditDoiTuongTrangCap, withBack);
		}
	}

	UpdateDoiTuongTrangCap(_item: DoiTuongTrangCapModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.objectService.UpdateDoiTuongTrangCap(_item).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				if (withBack == true) {
					this.dialogRef.close({
						_item
					});
				} else {
					this.change = true;
					this.ngOnInit();
					const _messageType = this.translate.instant('OBJECT.EDIT.UPDATE_MESSAGE', { name: this._NAME });
					this.layoutUtilsService.showInfo(_messageType).afterDismissed().subscribe(tt => { });
					this.focusInput.nativeElement.focus();
				}
			} else {
				if (res.error.allowForce) {
					const _title = res.error.message;
					const _description = res.error.message + ", tiếp tục?";
					const _waitDesciption = "Yêu cầu đang được xử lý";

					const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
					dialogRef.afterClosed().subscribe(res => {
						if (!res) {
							return;
						}
						let copy: any = Object.assign({}, _item);
						copy.IsForce = true;
						this.UpdateDoiTuongTrangCap(copy, withBack);
					});
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
			}
		});
	}

	CreateDoiTuongTrangCap(_item: DoiTuongTrangCapModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		// 	this.viewLoading = true;
		this.disabledBtn = true;
		this.objectService.CreateDoiTuongTrangCap(_item).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				if (withBack == true) {
					let temp = Object.assign({}, res.data);
					temp.DiaChi = this.listKhomAp.find(x => +x.id == +res.data.Id_KhomAp).title;
					temp.HoTen = res.data.HoTen
					if (res.data.Id_QHGiaDinh > 0)
						temp.Id_QHGiaDinh = this.listOpt1.find(x => +x.id == +res.data.Id_QHGiaDinh).title;
					else
						temp.Id_QHGiaDinh = "";
					this.dialogRef.close(temp);
				} else {
					const _messageType = this.translate.instant('OBJECT.EDIT.ADD_MESSAGE', { name: this._NAME });
					this.layoutUtilsService.showInfo(_messageType).afterDismissed().subscribe(tt => { });
					this.focusInput.nativeElement.focus();
					this.ngOnInit();
				}
			} else {
				this.viewLoading = false;
				if (res.error.allowForce) {
					const _title = res.error.message;
					const _description = res.error.message + ", tiếp tục?";
					const _waitDesciption = "Yêu cầu đang được xử lý";

					const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
					dialogRef.afterClosed().subscribe(res => {
						if (!res) {
							return;
						}
						let copy: any = Object.assign({}, _item);
						copy.IsForce = true;
						this.CreateDoiTuongTrangCap(copy, withBack);
					});
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
			}
		});
	}

	changeQuanHeGiaDinh() {
		if (this.itemForm.controls.HoTenThanNhan) {
			this.require = '';
		} else {
			this.require = 'require';
		}
	}

	loadGetListDistrictByProvinces(idProvince: any) {
		this.commonService.GetListDistrictByProvinces(idProvince).subscribe(res => {
			this.listdistrict = res.data;
			this.changeDetectorRefs.detectChanges();
		});
	}

	loadGetListWardByDistrict(idDistrict: any) {
		this.commonService.GetListWardByDistrict(idDistrict).subscribe(res => {
			this.listward = res.data;
			this.changeDetectorRefs.detectChanges();
		});
	}

	loadKhomAp() {
		this.commonService.GetListKhomApByWard(this.filterward).subscribe(res => {
			this.listKhomAp = res.data;
			this.changeDetectorRefs.detectChanges();
		});
	}

	loadListGioiTinh() {
		this.commonService.ListGioiTinh().subscribe(res => {
			this.listgioitinh = res.data;
		});
	}

	loadListQuanHeGiaDinh() {
		this.commonService.liteQHGiaDinhNCC().subscribe(res => {
			this.listOpt1 = res.data;			
			this.listquanhevoilietsy.next( res.data);
		});

	}

	loadListDoiTuongDC(){
		this.commonService.liteDoiTuongDC().subscribe((res) => {
			this.listdoituongdc.next(res.data);
			this.listOpt_dc = res.data;
		})
	}

	loadListDungCuChinhHinh() {
		let id_doituong = this.itemForm.controls.Id_DoiTuong.value;
		if(id_doituong) {
			this.commonService.liteDungCuChinhHinh(false, false, false, id_doituong).subscribe((res) => {
				this.listDungCuChinhHinh = res.data;
				this.listDoiTuongDC_added.forEach((ele)=>{
					
					if(this.Check_Exists(ele.id, res.data)){
						let index = this.listDungCuChinhHinh.findIndex(x => x.id === ele.id);
						this.listDungCuChinhHinh.splice(index,1);
					}				
				})
				this.changeDetectorRefs.detectChanges();							
			})
		}
	}

	changeNS(isNam = false) {
		if (isNam) {
			this.itemForm.controls.NgaySinh.setValue('');
		}
		else {
			let val = this.itemForm.controls.NgaySinh.value;
			if (val != null) {
				let y = moment(val).get('year');
				this.itemForm.controls.NamSinh.setValue(y);
			}
		}
	}

	add_DC() {		
		let controls = this.itemForm.controls;
		if ((controls.NamCap.disabled || controls.NamCap.valid) && controls.DungCuChinhHinh.valid) {
			let dcch = new DTChinhHinh_DetailDTO();
			dcch.Id_NCC = controls.Id_DoiTuong.value;
			dcch.Id = this.item.Id;
			dcch.id = controls.DungCuChinhHinh.value;
			dcch.NamCap = controls.NamCap.value;
			dcch.title = this.get_tendungcu(dcch.id);
			if(!this.Check_Exists(dcch.id,this.listDoiTuongDC_added)){
				this.xoaDT1(dcch.id);
				this.listDoiTuongDC_added.push(dcch);
			}
			this.table.renderRows();
		} else {
			this.validateAllFormFields(this.itemForm);
		}
	}

	Check_Exists(id, array) {
		return array.some(function(el) {
		  return el.id === id;
		}); 
	}

	validateAllFormFields(formGroup: FormGroup) {
		Object.keys(formGroup.controls).forEach((field) => {
		  const control = formGroup.get(field);
		  if (control instanceof FormControl) {
			control.markAsTouched({ onlySelf: true });
		  } else if (control instanceof FormGroup) {
			this.validateAllFormFields(control);
		  }
		});
	  }

	get_tendungcu(id){
		let index = this.listDungCuChinhHinh.findIndex(x => x.id === id);
		return this.listDungCuChinhHinh[index].title;
	}

	xoaDT(dt) {   
		this.loadListDungCuChinhHinh();     
		let index = this.listDoiTuongDC_added.findIndex(x => x === dt);
		this.listDoiTuongDC_added.splice(index,1);
	}

	xoaDT1(id) {
		let index = this.listDungCuChinhHinh.findIndex(x => x.id === id);
		this.listDungCuChinhHinh.splice(index,1);
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
		this.dialogRef.close(this.change);
	}
}
