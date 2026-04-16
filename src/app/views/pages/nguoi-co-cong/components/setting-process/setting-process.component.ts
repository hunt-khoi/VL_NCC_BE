import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, Inject, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Observable } from 'rxjs';
import { LayoutUtilsService } from '../../../../../core/_base/crud';
import { environment } from '../../../../../../environments/environment';
import { CommentService } from '../comment/comment.service';
import { CommonService } from '../../services/common.service';

@Component({
	selector: 'kt-setting-process',
	templateUrl: './setting-process.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingProcessComponent implements OnInit {
	Object: any;
	itemForm: FormGroup | undefined;
	hasFormErrors: boolean = false;
	filterStatic: Observable<string[]> | undefined;
	viewLoading: boolean = false;
	dataInPA: any = {
		processError: false
	};
	lstStep: any[] = []
	lstNguoiDung: any[] = []
	showForm: boolean = false;
	disabledBtn: boolean = false;
	apiData: string = "";
	dataChecker: any[] = [];
	stepSelected = false;
	FreeRoleChecker: boolean = false;
	@ViewChild('form', { static: true }) form: ElementRef | undefined;
	showChecker: boolean = false;
	selectedStep: any = undefined;
	viewLoading1: boolean = false;
	lstCapQuanLy: any = [];
	idStepCurrent: number = -1;
	lstdonViXuLy: any[] = [];
	idStepPhanAnh: number = -1;
	Type: number = 0;
	curr: any = null;
	ListXL: any[] = [];

	constructor(
		public dialogRef: MatDialogRef<SettingProcessComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private QuanLyPhanAnhFB: FormBuilder,
		public dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private commonService: CommonService,
		private commentService: CommentService
	) { }

	ngOnInit() {
		this.Type = this.data.Type;
		this.lstNguoiDung = [];
		this.commonService.getDSNguoiDungLite(false).subscribe(res => {
			if (res && res.status == 1) {
				this.lstNguoiDung = res.data;
			} else
				this.layoutUtilsService.showError(res.error.message);
			this.changeDetectorRefs.detectChanges();
		});
		this.Object = Object.assign({}, this.data.data);
		this.createForm();
		if (this.Object.id_phieu > 0) {
			//this.viewLoading = true;
			this.apiData = environment.ApiRoot + `/quy-trinh-duyet/FlowChart?id=${this.Object.id_phieu}&DoiTuong=${this.Type}`;
			//this.commonService.getObjectDetailById(this.Type, this.Object.id_phieu).subscribe(res => {
			//	if (res && res.status == 1) {
			//		this.dataInPA = Object.assign({}, res.data);
			//		this.idStepPhanAnh = this.dataInPA.IdStep;
			//		// if (this.data.FreeRoleChecker != undefined && this.data.FreeRoleChecker != null) {
			//		// 	this.FreeRoleChecker = this.data.FreeRoleChecker;/// cho phép thao tác với checker
			//		// 	this.showadd = this.FreeRoleChecker;
			//		// }
			//		this.getChecker(this.dataInPA.IdStep);

			//		this.commonService.getStep(this.dataInPA.IdProcess).subscribe(res => {
			//			if (res && res.status == 1) {
			//				this.lstStep = res.data;
			//			} else
			//				this.layoutUtilsService.showError(res.error.message);
			//			this.changeDetectorRefs.detectChanges();
			//		});
			//		this.createForm();
			//	}
			//	else {
			//		this.layoutUtilsService.showError(res.error.message);
			//	}
			//	this.viewLoading = false;
			//	this.changeDetectorRefs.detectChanges();
			//});
		}
		this.lstCapQuanLy = [];
		this.lstdonViXuLy = [];
		this.lstNguoiDung = [];
		//this.commonService.LoaiBuoc().subscribe(res => {
		//	if (res && res.data) {
		//		this.lstCapQuanLy = res.data;
		//		this.changeDetectorRefs.detectChanges();
		//	} else {
		//		this.layoutUtilsService.showError(res.error.message);
		//	}
		//},
		//	err => {
		//		this.layoutUtilsService.showError(err.message);
		//		return;
		//	});

		this.commentService.getDSYKien(this.Object.id_phieu, this.Type, false).subscribe(res => {
			if (res && res.status == 1) {
				this.ListXL = res.data;
				this.curr = res.dataExtra;
				this.changeDetectorRefs.detectChanges();
			}
		});
	}

	viewCheckers(data: any) {
		///	this.showadd = this.FreeRoleChecker;
		this.selectedStep = data;
		this.dataChecker = [];
		this.showChecker = false;
		this.viewLoading1 = true;
		this.disabledBtn = true;
		this.getChecker(data.IdRow);
	}

	getChecker(idrow: number) {
		this.commonService.CheckersByStep(this.Type, this.Object.id_phieu, idrow).subscribe(res => {
			this.viewLoading = false;
			this.viewLoading1 = false;
			this.disabledBtn = false;
			if (res.status == 1) {
				this.dataChecker = res.data;
				this.showChecker = true;
			}
			else {
				this.layoutUtilsService.showError(res.error.message);
			}
			this.changeDetectorRefs.detectChanges();
		});
	}

	closeDialog(ok = false) {
		this.dialogRef.close({ isEdit: ok });
		return;
	}

	getTitle(): string {
		return 'Quy trình xử lý';
	}

	createForm() {
		this.hasFormErrors = false;
		let temp: any = {
			//buttonText: ["", Validators.required],
			next: ["", Validators.required],
		};
		if (this.showForm) {
			temp.checker = ["", Validators.required];
			//temp.keyword = [""];
			//temp.capQuanLy = ["0"];
			//temp.donvi = "0";
		}
		this.itemForm = this.QuanLyPhanAnhFB.group(temp);
		this.changeDetectorRefs.detectChanges();
	}

	isControlInvalid(controlName: string): boolean {
		if (!this.itemForm) return false;
		const control = this.itemForm.controls[controlName];
		const result = control.invalid && control.touched;
		return result;
	}

	onSubmit() {
		this.hasFormErrors = false;
		if (!this.itemForm) return;
		const controls = this.itemForm.controls;
		/** check form */
		if (this.itemForm.invalid) {
			Object.keys(controls).forEach(controlName => {
				controls[controlName].markAsTouched();
			});
			this.hasFormErrors = true;
			this.changeDetectorRefs.detectChanges();
			return;
		}
		let _item: any = {};
		_item.Loai = this.Type;
		_item.Id = this.dataInPA.id_phieu;
		_item.isError = this.dataInPA.processError;
		_item.IdStep = this.idStepPhanAnh;
		_item.Next = controls['next'].value;
		//_item.ButtonText = controls['buttonText'].value;
		_item.Checkers = [];
		for (var i = 0; i < controls['checker'].value.length; i++) {
			_item.Checkers.push(controls['checker'].value[i].UserID);
		}
		this.disabledBtn = true;
		//this.commonService.FixProcess(_item).subscribe(res => {
		//	this.disabledBtn = false;
		//	if (res.status == 1) {
		//		const message = `Cập nhật quy trình thành công`;
		//		this.layoutUtilsService.showInfo(message);
		//		this.closeDialog(true);
		//	}
		//	else {
		//		this.layoutUtilsService.showError(res.error.message);
		//	}
		//},
		//	err => {
		//		this.disabledBtn = false;
		//		const message = err.message;
		//		this.layoutUtilsService.showError(err.message);
		//	});
	}

	closeCheckers() {
		this.stepSelected = false;
		this.showForm = false;
		this.createForm();
	}

	themNguoi(item: any) {
		this.showForm = true;
		this.createForm();
		if (!this.itemForm || !this.form) return;
		this.idStepCurrent = item.IdStep;
		//this.itemForm.controls["capQuanLy"].setValue('0');
		//this.filterDVXL();
		this.stepSelected = true;
		this.itemForm.controls["next"].setValue(item.Next);
		//this.itemForm.controls["keyword"].setValue('');
		//this.itemForm.controls["buttonText"].setValue(item.ButtonText);
		//this.itemForm.controls["capQuanLy"].setValue('0');
		//this.itemForm.controls["donvi"].setValue('0');
		this.itemForm.controls["checker"].setValue('');
		var ele = document.getElementById("formContainer" + item.IdPro);
		if (ele != undefined)
			ele.appendChild(this.form.nativeElement);
	}

	//filterNguoiXuLy() {
	//	const controls = this.itemForm.controls;
	//	let next = controls['next'].value;
	//	let IdCapDV = controls['capQuanLy'].value + '';
	//	let IdDV = controls['donvi'].value + '';
	//	let keyword = controls['keyword'].value;
	//	this.getUserForChecker(this.idStepCurrent, next, IdCapDV, keyword, IdDV);
	//}

	//filterDVXL() {
	//	this.itemForm.controls["donvi"].setValue('0');
	//	this.lstdonViXuLy = [];
	//	this.lstNguoiDung = [];
	//	const filter: any = {};
	//	if (this.itemForm.controls['capQuanLy'].value != '0') {
	//		filter.CapDV = this.itemForm.controls['capQuanLy'].value;
	//	}
	//	const queryParams = new QueryParamsModel(
	//		filter,
	//		'asc',
	//		'TenPhuongXa',
	//		1,
	//		10,
	//	);
	//	queryParams.more = true;
	//	this.commonService.getDSDonViLite().subscribe(res => {
	//		if (res.status == 1) {
	//			this.lstdonViXuLy = res.data;
	//			this.filterNguoiXuLy();
	//		}
	//		else {
	//			const message = res.error.message;
	//			this.layoutUtilsService.showError(message);
	//		}
	//		this.changeDetectorRefs.detectChanges();
	//	});
	//}

	//getUserForChecker(idstep, next, IdCapDV = '0', keyword = '', IdDV = '0') {
	//	this.lstNguoiDung = [];
	//	let filter: any = {};
	//	filter.idpa = this.dataInPA.id_phieu;
	//	filter.idstep = idstep;
	//	filter.idnext = next;
	//	filter.idcapdv = IdCapDV;
	//	filter.iddv = IdDV;
	//	filter.keyword = keyword;
	//	const queryParams = new QueryParamsModel(
	//		filter,
	//		'asc',
	//		'TenPhuongXa',
	//		1,
	//		10,
	//	);
	//	queryParams.more = true;
	//	queryParams.filter = filter;
	//	this.lstNguoiDung = [];
	//	//this.commonService.getDanhSachNguoiDungXuLyStep(queryParams).subscribe(res => {
	//	//	if (res && res.status == 1) {
	//	//		this.lstNguoiDung = res.data;
	//	//	} else
	//	//		this.layoutUtilsService.showError(res.error.message);
	//	//	this.changeDetectorRefs.detectChanges();
	//	//});
	//}
}
