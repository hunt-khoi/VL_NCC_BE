import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, Inject, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { LayoutUtilsService } from 'app/core/_base/crud';
import { DM_DonViService } from '../Services/dm-don-vi.service';
import { DM_DonViModel, ListImageModel } from '../Model/dm-don-vi.model';
import { TreeDonViDialogComponent } from '../../../components/tree-don-vi-dialog/tree-don-vi-dialog.component';
import { environment } from 'environments/environment';

@Component({
	selector: 'kt-dm-don-vi-edit',
	templateUrl: './dm-don-vi-edit.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class DM_DonViEditComponent implements OnInit, OnDestroy {
	// Public properties
	DM_DonVi: DM_DonViModel = new DM_DonViModel();
	itemForm: FormGroup | undefined;
	hasFormErrors: boolean = false;
	disabledBtn: boolean = false;
	loadingSubject = new BehaviorSubject<boolean>(true);
	loading$: Observable<boolean> = this.loadingSubject.asObservable();
	viewLoading: boolean = false;
	isChange: boolean = false;
	fixedPoint = 0;
	isZoomSize: boolean = false;
	lst_DanhMucDV: any;
	parentDV: number = 0;
	parentName: string = "";
	isShowImage: boolean = false;
	private componentSubscriptions: Subscription | undefined;
	picLogo: ListImageModel[] = [];
	imgvlLogo: any;

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
		public dialogRef: MatDialogRef<DM_DonViEditComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private DM_DonViFB: FormBuilder,
		public dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private apiService: DM_DonViService) { }

	async ngOnInit() {
		// this.imageLogo = {
		// 	RowID: "",
		// 	Title: "",
		// 	Description: "",
		// 	Required: false,
		// 	Files: []
		// }
		this.viewLoading = true;
		this.DM_DonVi = new DM_DonViModel();
		this.DM_DonVi.clear();
		this.createForm();
		if (this.data.DM_DonVi && this.data.DM_DonVi.Id > 0) {
			this.apiService.getById(this.data.DM_DonVi.Id).subscribe(res => {
				this.viewLoading = false;
				if (res.status == 1 && res.data) {
					this.DM_DonVi = res.data;
					this.parentDV = this.DM_DonVi.Parent ? this.DM_DonVi.Parent : 0;
					//this.parentName=this.DM_DonVi.ParentName?this.DM_DonVi.ParentName:"";
					if (this.DM_DonVi.Logo) {		
						let tmpElement = new ListImageModel();
						tmpElement.clear();
						tmpElement.src = this.DM_DonVi.Logo,
						tmpElement.type="image/png",
						this.picLogo.push(tmpElement);
					}
					this.createForm();
				}
				else {
					this.layoutUtilsService.showError(res.error.message);
				}
				this.changeDetectorRefs.detectChanges();
			});
		} else {
			this.viewLoading = false;
			this.changeDetectorRefs.detectChanges();
		}
	}

	ngOnDestroy() {
		if (this.componentSubscriptions) {
			this.componentSubscriptions.unsubscribe();
		}
	}

	createForm() {
		this.itemForm = this.DM_DonViFB.group({
			donVi: [this.DM_DonVi.DonVi == null ? '' : this.DM_DonVi.DonVi, Validators.required],
			maDonvi: [this.DM_DonVi.MaDonvi == null ? '' : this.DM_DonVi.MaDonvi, Validators.required],
			maDinhDanh: [this.DM_DonVi.MaDinhDanh ?  this.DM_DonVi.MaDinhDanh: ''],
			parentName: [this.DM_DonVi.ParentName == null ? '' : this.DM_DonVi.ParentName],
			loaiDonVi: [this.DM_DonVi.LoaiDonVi == 0 ? '' : this.DM_DonVi.LoaiDonVi, Validators.required],
			sDT: [this.DM_DonVi.SDT, [Validators.pattern(/^([0-9|,]*)$/), Validators.minLength(9), Validators.maxLength(12)]],
			email: [this.DM_DonVi.Email == null ? '' : this.DM_DonVi.Email, [Validators.pattern(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)]],
			diaChi: [this.DM_DonVi.DiaChi == null ? '' : this.DM_DonVi.DiaChi],
			logo: [this.DM_DonVi.Logo == null ? '' : this.DM_DonVi.Logo],
			priority: [this.DM_DonVi.Priority ? this.DM_DonVi.Priority : 1, [Validators.required, Validators.min(1)]],
			locked: [this.DM_DonVi.Locked?[this.DM_DonVi.Locked]: false],
			dangKyLichLanhDao: [this.DM_DonVi.DangKyLichLanhDao ? true : false],
			khongCoVanThu: [this.DM_DonVi.KhongCoVanThu ? true : false],
			imageLogo: [this.picLogo],
		});
	}

	getTitle(): string {
		if (this.DM_DonVi.Id == 0) 
			return 'Thêm mới đơn vị';
		if (this.data.DM_DonVi.IsShow)
			return `Xem đơn vị - ${this.DM_DonVi.DonVi} `;
		return `Chỉnh sửa đơn vị - ${this.DM_DonVi.DonVi}(${this.DM_DonVi.MaDonvi}) `;
	}

	onSubmit(type: boolean) {
		this.hasFormErrors = false;
		if (!this.itemForm) return;
		const controls = this.itemForm.controls;
		if (this.itemForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);
			let invalid = <FormControl[]>Object.keys(controls).map(key => controls[key]).filter(ctl => ctl.invalid);
			let invalidElem: any = invalid[0];
			invalidElem.nativeElement.focus();
			this.hasFormErrors = true;
			return;
		}
		this.disabledBtn = true;
		let editedDM_DonVi = this.prepare();
		if (this.DM_DonVi.Id > 0) {
			this.update(editedDM_DonVi)
			return;
		}
		this.add(editedDM_DonVi, type);
	}

	prepare(): DM_DonViModel {
		if (!this.itemForm) return new DM_DonViModel();
		const controls = this.itemForm.controls;
		const _item = new DM_DonViModel();
		_item.clear();
		_item.DonVi = controls['donVi'].value;
		_item.MaDonvi = controls['maDonvi'].value;
		_item.MaDinhDanh = controls['maDinhDanh'].value;
		_item.LoaiDonVi = controls['loaiDonVi'].value ? Number(controls['loaiDonVi'].value) : 0;
		_item.Parent = this.parentDV;
		_item.SDT = controls['sDT'].value;
		_item.Email = controls['email'].value;
		_item.DiaChi = controls['diaChi'].value;
		_item.Logo = controls['logo'].value;
		_item.Priority = controls['priority'].value ? Number(controls['priority'].value) :1;
		_item.DangKyLichLanhDao = controls['dangKyLichLanhDao'].value?controls['dangKyLichLanhDao'].value:false;
		_item.KhongCoVanThu = controls['khongCoVanThu'].value?controls['khongCoVanThu'].value:false;
		_item.listLinkImage = [];	

		this.imgvlLogo = controls['imageLogo'].value;
		if (this.imgvlLogo.length > 0) {
			for (let i = 0; i < this.imgvlLogo.length; i++) {
				const md = new ListImageModel();
				md.strBase64 = this.imgvlLogo[i].strBase64;
				md.filename = this.imgvlLogo[i].filename;
				md.src = this.imgvlLogo[i].src;
				md.IsAdd = this.imgvlLogo[i].IsAdd;
				md.IsDel = this.imgvlLogo[i].IsDel;
				md.IsImagePresent = true;
				_item.listLinkImage.push(md);
			}
		} 
		if (this.DM_DonVi.Id > 0) {
			_item.Id = this.DM_DonVi.Id;
			_item.Locked = controls['locked'].value ;
		}
		return _item;
	}

	add(item: DM_DonViModel, withBack: boolean = false) {
		this.apiService.create(item).subscribe(res => {
			if (res.status == 1) {
				this.isChange = true;
				const message = "Thêm thành công";
				this.layoutUtilsService.showInfo(message);
				if (this.itemForm)
					this.itemForm.reset();
				if (withBack)
					this.dialogRef.close(this.isChange);
			}
			else {
				this.layoutUtilsService.showError(res.error.message);
			}
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
		});
	}

	update(item: DM_DonViModel) {
		this.apiService.update(item).subscribe(res => {
			if (res.status == 1) {
				this.isChange = true;
				const message = "Cập nhật thành công";
				this.layoutUtilsService.showInfo(message);
				this.dialogRef.close(this.isChange);
			}
			else {
				this.layoutUtilsService.showError(res.error.message);
			}
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
		});
	}

	openTreeDonVi() {
		const dialogRef = this.dialog.open(TreeDonViDialogComponent, { data: {} });
		dialogRef.afterClosed().subscribe(res => {
			if (!this.itemForm || !res) 
				return;
			this.parentDV = res.data.IdGroup;
			this.itemForm.controls["parentName"].setValue(res.text);
			this.changeDetectorRefs.detectChanges();
		});
	}

	clearCapTren() {
		this.parentDV = 0;
		if (!this.itemForm) return;
		this.itemForm.controls["parentName"].setValue("");
		this.changeDetectorRefs.detectChanges();
	}

	onAlertClose() {
		this.hasFormErrors = false;
	}

	closeDialog() {
		this.dialogRef.close(this.isChange);
	}

	ValidateChangeNumberEvent(event: any) {
		if (event.target.value == null || event.target.value == '') {
			const message = 'Không thể để trống dữ liệu';
			this.layoutUtilsService.showError(message);
			return false;
		}
		var count = 0;
		for (let i = 0; i < event.target.value.length; i++) {
			if (event.target.value[i] == '.') {
				count += 1;
			}
		}
		var regex = /[a-zA-Z -!$%^&*()_+|~=`{}[:;<>?@#\]]/g;
		var found = event.target.value.match(regex);
		if (found != null) {
			const message = 'Dữ liệu không gồm chữ hoặc kí tự đặc biệt';
			this.layoutUtilsService.showError(message);
			return false;;
		}
		if (count >= 2) {
			const message = 'Dữ liệu không thể có nhiều hơn 2 dấu .';
			this.layoutUtilsService.showError(message);
			return false;;
		}
		return true;
	}

	f_currency_V2(value: string): any {
		if (value == '-1') return '';
		if (value == null || value == undefined || value == '') value = '0';
		let nbr = Number((value + '').replace(/,/g, ""));
		return (nbr + '').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
	}

	changeValueOfForm(controlName: string, event: any) {
		if (!this.itemForm) return;
		if (this.ValidateChangeNumberEvent(event)) {
			let tmpValue = this.itemForm.controls[controlName].value.replace(/,/g, "");
			this.itemForm.controls[controlName].setValue(this.f_currency_V2(tmpValue));
		}
		else {
			this.itemForm.controls[controlName].setValue(event.target.value);
		}
	}

	selectFile() {
		let f = document.getElementById("FileUpLoad");
		if (f) f.click();
	}

	DeleteFile() {
		let f = document.getElementById("img_icon");
		let a = document.getElementById("img_icon") as HTMLInputElement;
		if (!this.itemForm || !a || !f) 
			return;

		f.setAttribute("src", "");
		a.type = "text";
		a.type = "file";

		this.itemForm.controls['strBase64'].setValue('');
		this.itemForm.controls['isnew'].setValue(true);
		if (this.itemForm.controls['strBase64'].value != '') {
			this.isShowImage = true;
		}
		else {
			this.isShowImage = false;
		}
		this.changeDetectorRefs.detectChanges();
	}

	FileChoose(evt: any) {
		if (evt.target.files && evt.target.files.length) { // Nếu có file
			let file = evt.target.files[0]; // Ví dụ chỉ lấy file đầu tiên
			let size = file.size;
			if (size >= environment.DungLuong) {
				const message = `Không thể upload hình dung lượng cao hơn 3MB.`;
				this.layoutUtilsService.showError(message);
				return;
			}
			let reader = new FileReader();
			reader.readAsDataURL(evt.target.files[0]);
			let base64Str: any;
			let extension: any;
			reader.onload = function () {
				base64Str = reader.result as String;
				extension = base64Str.match(/[^:/]\w+(?=;|,)/)[0];
				var metaIdx = base64Str.indexOf(';base64,');
				base64Str = base64Str.substr(metaIdx + 8); // Cắt meta data khỏi chuỗi base64
			};
			setTimeout(_ => {
				if (!this.itemForm) return;
				this.itemForm.controls['strBase64'].setValue(base64Str);
				this.itemForm.controls['filename'].setValue(`${evt.target.files[0].name}`);
				this.itemForm.controls['extension'].setValue(extension);
				this.itemForm.controls['isnew'].setValue(true);
				if (this.itemForm.controls['strBase64'].value != '') {
					this.isShowImage = true;
				}
				else {
					this.isShowImage = false;
				}
				this.changeDetectorRefs.detectChanges();

				let f = document.getElementById("img_icon");
				if (f)
					f.setAttribute("src", `data:image/${extension};base64,` + base64Str);
			}, 1000);
		}
	}
}