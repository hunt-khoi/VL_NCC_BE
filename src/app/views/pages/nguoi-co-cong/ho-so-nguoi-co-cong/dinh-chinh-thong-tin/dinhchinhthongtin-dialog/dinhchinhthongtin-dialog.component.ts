import { Component, OnInit, ViewChild, ElementRef, Inject, ChangeDetectorRef, HostListener } from '@angular/core';
import { MatDatepicker, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormControl } from '@angular/forms';
import { ReplaySubject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
// Services
import { TypesUtilsService } from './../../../../../../core/_base/crud/utils/types-utils.service';
import { LayoutUtilsService } from './../../../../../../core/_base/crud/utils/layout-utils.service';
import { CommonService } from 'app/views/pages/nguoi-co-cong/services/common.service';
import { GiayToModel } from './../../giay-to/Model/giay-to.model';
import { ListInfoChangelModel } from '../Model/Dinhchinhthongtin.model';
import { DinhChinhModel, FileUploadModel } from './../Model/Dinhchinhthongtin.model';
import { DinhChinhThongTinService } from './../Services/dinh-chinh-thong-tin.service';

@Component({
	selector: 'kt-dinhchinhthongtin-dialog',
	templateUrl: './dinhchinhthongtin-dialog.component.html',
})

export class DinhchinhthongtinDialogComponent implements OnInit {

	item: any;
	ncc: any = {};
	itemForm: FormGroup;
	hasFormErrors = false;
	viewLoading = false;
	loadingAfterSubmit = false;
	disabledBtn = false;
	isZoomSize = false;
	allowEdit = false;
	allowDuyet = false;
	@ViewChild(MatDatepicker, { static: true }) picker;
	@ViewChild('focusInput', { static: true }) focusInput: ElementRef;
	year = new FormControl(moment());
	_NAME = '';
	maxNS: any;
	ListColumn: Array<ListInfoChangelModel> = [];
	listField: any;
	listdoituongncc: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
	listOpt: any = [];
	ID_NCC;
	FilterCtrl: string = '';
	_maxyear: any;
	AttachFileComment: any[] = [];
	_File: any[] = [];
	listGiayTo: any[] = [];
	formGiayTo: any[] = [];
	listLoaiGiayTo: any[] = [];
	tenFile: string = '';
	daduyet = false;
	GhiChu: string;
	isThanNhan: boolean;
	checkTN = false;
	@ViewChild('fileUpload', { static: true }) fileUpload;

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
		public dialogRef: MatDialogRef<DinhchinhthongtinDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private commonService: CommonService,
		private objectService: DinhChinhThongTinService,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private typesUtilsService: TypesUtilsService,
		private router: Router,
		private translate: TranslateService) {
		this._NAME = this.translate.instant('DINHCHINH.NAME');
	}

	ngOnInit() {
		this.commonService.liteLoaiGiayTo().subscribe(res => {
			this.listLoaiGiayTo = res.data;
			this.listLoaiGiayTo.unshift({
				id: '',
				title: '--Chọn--'
			})
		});
		this._maxyear = moment(new Date());
		this.item = this.data._item;
		if (this.data.allowEdit != undefined)
			this.allowEdit = this.data.allowEdit;
		if (this.data.allowDuyet != undefined)
			this.allowDuyet = this.data.allowDuyet;
		if (this.data.checkTN != undefined)
			this.checkTN = this.data.checkTN;
		this.loadListDoiTuongNCC();
		this.commonService.liteGiayTo().subscribe(res => {
			this.listGiayTo = res.data;
		});
		this.objectService.GetListField().subscribe(res => {
			if (res && res.status == 1) {
				this.listField = res.data;
				this.changeDetectorRefs.detectChanges();
			};
		});
		this.ID_NCC = this.router.url.split('/')[2];
		//this.AddRow_formGiayTo();

		if (this.item.ID_DC > 0) 
			this.LoadListData();
		else 
			this.AddColum();

		this.changeDetectorRefs.detectChanges();
	}

	TypeOfColumn(type) {
		var result = 'text';
		if (type) {
			if (type == 1)
				return 'text';
			if (type == 2) {
				return 'date';
			}
			if (type == 3) {
				return 'dropdown'
			}
			if (type == 4) {
				return 'year'
			}
		}
		return result;

	}

	AddRow_formGiayTo() {
		if (this.formGiayTo.length == 0) {
			var newRow = new GiayToModel()
			newRow.clear();
			newRow.Id_NCC = this.ID_NCC;
			this.formGiayTo.push(newRow);
		}
		else {
			if (!this.LastTableIsNull()) {
				var newRow = new GiayToModel()
				newRow.clear();
				newRow.Id_NCC = this.ID_NCC;
				this.formGiayTo.push(newRow);
			}
			else {
				this.layoutUtilsService.showError('Thêm đầy đủ dữ liệu khi tạo dòng mới')
			}
		}
	}

	LastTableIsNull(): boolean {
		var lastitem = this.formGiayTo[this.formGiayTo.length - 1];
		if (lastitem.GiayTo && lastitem.Id_LoaiGiayTo && lastitem.NgayCap && lastitem.NoiCap && lastitem.So) {
			return false;
		}
		else {
			return true;
		}
	}

	filter() {
		if (!this.listOpt) {
			return;
		}
		let search = this.FilterCtrl;
		if (!search) {
			this.listdoituongncc.next(this.listOpt.slice());
			return;
		} else {
			search = search.toLowerCase();
		}
		this.listdoituongncc.next(
			this.listOpt.filter(ts =>
				ts.title.toLowerCase().indexOf(search) > -1)
		);
		this.changeDetectorRefs.detectChanges();
	}

	AddColum() {
		if (this.ListColumn.length == 0 || !(this.ListColumn[this.ListColumn.length - 1].ColumnName == '') && !(this.ListColumn[this.ListColumn.length - 1].GiaTriMoi == '')) {
			var x = new ListInfoChangelModel();
			x.clear();
			this.ListColumn.push(x)
		} else {
			this.layoutUtilsService.showError('Thêm đầy đủ dữ liệu khi tạo dòng mới')
		}
	}

	DeleteCol(index) {
		this.ListColumn.splice(index, 1);
	}

	DeleteRowTable(index) {
		this.formGiayTo.splice(index, 1);
	}

	loadListDoiTuongNCC() {
		this.commonService.liteDoiTuongNCC().subscribe(res => {
			this.listdoituongncc.next(res.data);
			this.listOpt = res.data;
		});
	}

	ViewData() {
		var dataList = [];
		if (this.formGiayTo.length > 0) {
			if (this.LastTableIsNull()) {
				dataList = this.formGiayTo.slice(0, this.formGiayTo.length - 1)
			}
			else {
				dataList = this.formGiayTo;
			}
			if (dataList.length > 0) {
				for (let i = 0; i < dataList.length; i++) {
					if (dataList[i].GiayTo && dataList[i].Id_LoaiGiayTo && dataList[i].NgayCap && dataList[i].NoiCap && dataList[i].So) {
					} else {
						this.layoutUtilsService.showError('Nhập đủ thông tin giấy tờ trước khi gửi')
						return null;
					}
					if (i == (dataList.length - 1)) {
						return dataList;
					}
				}
			}
			else {
				this.layoutUtilsService.showError('Phải có thông tin giấy tờ trước khi gửi')
				return null;
			}
		}
		return dataList;
	}

	checkShow(index: number) {
		try {
			let r = this.listField.filter((item, vi) => {
				let t1 = this.ListColumn.findIndex(x => x.ColumnName === item.ID_Row);
				return t1 !== -1 ? t1 == index : t1 == -1;
			});
			return r;
		} catch (error) {
			return [];
		}
	}

	changeField(value) {
		var dataList = [];
		if (this.formGiayTo.length > 0) {

			if ((this.ListColumn[this.ListColumn.length - 1].ColumnName == '') && (this.ListColumn[this.ListColumn.length - 1].GiaTriMoi == '')) {
				dataList = this.ListColumn.slice(0, this.ListColumn.length - 1)
			}
			else {
				dataList = this.ListColumn.slice(0, this.ListColumn.length)
			}
		}
	}

	SetupType(value, index) {
		this.ListColumn[index].Type = (+value.Type);
		this.ListColumn[index].GiaTriMoi = '';
		if (this.ListColumn[index].Type == 4) {
			this.ListColumn[index].GiaTriMoi = moment(new Date());
		}
	}

	/** UI */
	getTitle(): string {
		if (this.allowDuyet)
			return 'Duyệt đính chính';
		let result = this.translate.instant('COMMON.CREATE');
		if (!this.allowEdit) {
			result = 'Xem chi tiết';
			return result;
		}
		if (!this.item || !this.item.ID_DC) {
			return result;
		}

		result = this.translate.instant('COMMON.UPDATE');
		return result;
	}

	selectFile() {
		// this.item.controls['ErrorMessage'].setValue('');
		let el: HTMLElement = this.fileUpload.nativeElement as HTMLElement;
		el["type"] = "text";
		el["type"] = "file";
		el.click();
	}

	checkDataIsValid(): boolean {
		let p = document.getElementById("fileUploadExcel");
		return this.itemForm.controls['fileDinhKems'] && this.item.controls['fileDinhKems'].valid && (p ? (p["type"] == 'file' ? p["files"]["length"] > 0 : false) : false);
	}

	FileSelected(evt: any, index: number) {
		if (evt.target.files && evt.target.files.length) {//Nếu có file
			let file = evt.target.files[0]; // Ví dụ chỉ lấy file đầu tiên
			let size = file.size;
			let filename = file.name;
			// if (size >= 9999999) {
			// 	const message = `Không thể upload hình dung lượng quá cao.`;
			// 	this.layoutUtilsService.showActionNotification(message, MessageType.Update, 10000, true, false);
			// 	return;
			// }
			let reader = new FileReader();
			reader.readAsDataURL(evt.target.files[0]);
			let base64Str;
			reader.onload = function () {
				base64Str = reader.result as String;
				var metaIdx = base64Str.indexOf(';base64,');
				base64Str = base64Str.substr(metaIdx + 8); // Cắt meta data khỏi chuỗi base64
			};
			// const controls = this.itemForm.controls;
			var model = new FileUploadModel();
			setTimeout(res => {
				model = new FileUploadModel();
				let file = evt.target.files[0]; // Ví dụ chỉ lấy file đầu tiên
				model.strBase64 = base64Str;
				model.filename = filename;
				model.Type = file.type;
				// model.size = this.calculateImageSize(base64Str);
				this.formGiayTo[index].FileDinhKem = model;
				this.formGiayTo[index].src = model.filename;
				// model.size = file.size;
				// this.AttachFileComment = [];
				// this.AttachFileComment.push(model);
				// 
				// this.ListColumn[index].Documents = this.AttachFileComment;
				// this.changeDetectorRefs.detectChanges();
			}, 1000);
		}
	}

	onSubmit(withBack: boolean = false) {
		if (this.ListColumn.length == 0) {
			this.layoutUtilsService.showError('Thông tin thay đổi là bắt buộc')
			return;
		}
		var dataList = [];
		if ((this.ListColumn[this.ListColumn.length - 1].ColumnName == '') && (this.ListColumn[this.ListColumn.length - 1].GiaTriMoi == '')) {
			dataList = this.ListColumn.slice(0, this.ListColumn.length - 1)
		}
		else {
			dataList = this.ListColumn.slice(0, this.ListColumn.length)
		}
		if (dataList.length > 0) {
			for (let i = 0; i < dataList.length; i++) {
				if (dataList[i].ColumnName == '' || dataList[i].GiaTriMoi == '') {
					this.layoutUtilsService.showError('Nhập đủ dữ liệu trước khi gửi');
					return
				}
				if (i == (dataList.length - 1)) {
					//nếu type = year converse from moment => year
					for (var index = 0; index < dataList.length; index++) {
						if (dataList[index].Type == 'year') {
							dataList[index].GiaTriMoi = dataList[index].GiaTriMoi.year();
						}
					}
					var data = new DinhChinhModel();
					data.clear();
					data.ID_NCC = this.ID_NCC;
					data.GhiChu = this.GhiChu;
					data.IsThanNhan = this.isThanNhan
					data.ListColumn = dataList;
					data.GiayTo = this.ViewData()
					if (this.item.ID_DC > 0) {
						data.Id = this.item.ID_DC;
						this.UpdateData(data, true);
					} else {
						this.Create(data, true);
					}
				}
			}
			dataList.forEach(res => {
				if (res.ColumnName == '' || res.GiaTriMoi == '') {
					return;
				}
			})
		}
		else {
			this.layoutUtilsService.showError('Phải có dữ diệu trước khi gửi')
			return;
		}
	}

	kbytes: number;
	calculateImageSize(base64String) {
		let padding;
		let inBytes;
		let base64StringLength;
		if (base64String.endsWith('==')) { padding = 2; }
		else if (base64String.endsWith('=')) { padding = 1; }
		else { padding = 0; }
		base64StringLength = base64String.length;
		inBytes = (base64StringLength / 4) * 3 - padding;
		this.kbytes = inBytes / 1000;
		return this.kbytes;
	}

	LoadListData() {
		this.objectService.getItem(this.item.ID_DC).subscribe(res => {
			if (res && res.status == 1) {
				this.GhiChu = res.data.GhiChu;
				this.isThanNhan = res.data.IsThanNhan;
				this.ListColumn = res.data.ThongTinDinhChinh;
				this.formGiayTo = res.data.LoadGiayTo;
				this.formGiayTo.forEach(element => {
					element.NgayCap = element.NgayCap.slice(0, 10);
				});
				this.changeDetectorRefs.detectChanges();
			};
		});
	}

	DuyetTin(item) {
		var data = new DinhChinhModel();
		data.clear();
		data.ID_NCC = this.ID_NCC;
		data.Id = this.item.ID_DC;
		data.IsDuyet = item;
		this.objectService.Approved(data).subscribe(res => {
			this.dialogRef.close({
			});
		})
	}

	Create(_item: any, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.disabledBtn = true;
		this.objectService.Create(_item).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				if (withBack == true) {
					this.dialogRef.close({
						_item
					});
				} else {
					const _messageType = this.translate.instant('OBJECT.EDIT.ADD_MESSAGE', { name: this._NAME });
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

	UpdateData(_item: any, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.disabledBtn = true;
		this.objectService.Create(_item).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				if (withBack == true) {
					this.dialogRef.close({
						_item
					});
				} else {
					const _messageType = this.translate.instant('OBJECT.EDIT.ADD_MESSAGE', { name: this._NAME });
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

	chosenYearHandler(normalizedYear: any, datepicker: MatDatepicker<any>, index) {
		const ctrlValue = moment(new Date());
		ctrlValue.year(normalizedYear.year());
		this.ListColumn[index].GiaTriMoi = (ctrlValue);
		datepicker.close();
	}

	GetYear(value) {
		var year;
		var x = this.ListColumn.findIndex(x => x.ColumnName == value);
		if (x) {
			year = this.ListColumn[x].GiaTriMoi == '' ? new Date().getFullYear() : this.ListColumn[x].GiaTriMoi;
		}
		return new Date('01/01/' + year)
	}

	resizeDialog() {
		if (!this.isZoomSize) {
			this.dialogRef.updateSize('100vw', '100vh');
			this.isZoomSize = true;
		} else if (this.isZoomSize) {
			this.dialogRef.updateSize('900px', 'auto');
			this.isZoomSize = false;
		}
	}
	
	reset() {
		this.item = Object.assign({}, this.item);
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

	DownloadFile(link) {
		window.open(link);
	}
}
