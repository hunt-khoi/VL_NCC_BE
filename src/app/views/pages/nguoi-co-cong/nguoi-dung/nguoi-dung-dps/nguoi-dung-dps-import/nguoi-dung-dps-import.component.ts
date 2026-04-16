// Angular
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
// Service
import { LayoutUtilsService, MessageType } from 'app/core/_base/crud';
import { NguoiDungDPSService } from '../Services/nguoi-dung-dps.service';
import { NguoiDungDPSModel } from '../Model/nguoi-dung-dps.model';

@Component({
	selector: 'kt-nguoi-dung-dps-import',
	templateUrl: './nguoi-dung-dps-import.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class NguoiDungDPSImportComponent implements OnInit, OnDestroy {
	
	// Public properties
	@ViewChild('fileUpload', { static: true }) fileUpload;
	NguoiDungDPS: NguoiDungDPSModel;
	itemForm: FormGroup;
	hasFormErrors: boolean = false;

	loadingSubject = new BehaviorSubject<boolean>(true);
	loading$: Observable<boolean>;

	viewLoading: boolean = false;
	isChange: boolean = false;
	_soLanImport: number = 0;
	_dataImport: any[] = [];
	HTMLStr:string='';
	isZoomSize: boolean = false;
	disabledBtn: boolean = false;
	private componentSubscriptions: Subscription;

	constructor(
		public dialogRef: MatDialogRef<NguoiDungDPSImportComponent>,
		private NguoiDungDPSFB: FormBuilder,
		public dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private NguoiDungDPSsService: NguoiDungDPSService) {}

	ngOnInit() {
		this.viewLoading = false;
		this.NguoiDungDPSsService.data_import.subscribe(res => {
			this._dataImport = [...res];
		});
		this.createForm();
	}

	ngOnDestroy() {
		if (this.componentSubscriptions) {
			this.componentSubscriptions.unsubscribe();
		}
		this.NguoiDungDPSsService.data_import.next([]);
	}

	createForm() {
		this.itemForm = this.NguoiDungDPSFB.group({
			FileDuLieu: [''],
			ErrorMessage: [''],
		});
	}

	isControlInvalid(controlName: string): boolean {
		const control = this.itemForm.controls[controlName];
		const result = control.invalid && control.touched;
		return result;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}
	numberOnly(event): boolean {
		const charCode = (event.which) ? event.which : event.keyCode;
		if (charCode > 31 && (charCode < 48 || charCode > 57)) {
			return false;
		}
		return true;
	}
	closeDialog() {
		this.dialogRef.close(this.isChange); 
	}
	selectFile() {
		this.itemForm.controls['ErrorMessage'].setValue('');
		let el: HTMLElement = this.fileUpload.nativeElement as HTMLElement;
		el["type"] = "text";
		el["type"] = "file";
		el.click();
	}
	FileSelected(evt: any) {
		if (evt.target.files && evt.target.files.length) {//Nếu có file
			let file = evt.target.files[0]; // Ví dụ chỉ lấy file đầu tiên
			let fileName = file.name;

			var res = fileName.match(/.xls$|.xlsx$/g);
			if (res) {
				if (!res["includes"]('.xlsx') && !res["includes"]('.xls')) {
					this.layoutUtilsService.showError('File không hợp lệ.');
					return;
				}
				else {
					this.itemForm.controls['FileDuLieu'].patchValue(fileName); // Set value cho control dùng để validate (trường hợp base64)
					this.DocDuLieu();
				}
			}
			else {
				this.layoutUtilsService.showError('File không hợp lệ');
				return;
			}
		}
		else {//Không có file
			this.itemForm.controls['FileDuLieu'].patchValue('');
		}
	}

	checkDataIsValid(): boolean {
		let p = document.getElementById("fileUploadExcel");
		return this.itemForm.controls['FileDuLieu'] && this.itemForm.controls['FileDuLieu'].valid && (p ? (p["type"] == 'file' ? p["files"]["length"] > 0 : false) : false);
	}

	DocDuLieu() {
		let t = this.checkDataIsValid();
		if (t) this.Importfile();
		else this.layoutUtilsService.showError("Mời chọn file");
	}

	Importfile() {
		let el: any = this.fileUpload.nativeElement;
		var service = this.NguoiDungDPSsService;
		var useBase64: boolean = true;
		for (var idx = 0; idx < el.files.length; idx++) {
			if (useBase64) {
				var fileName = el.files[idx].name;
				let reader = new FileReader();
				var a=this.itemForm.controls['FileDuLieu'];
				var b=this.itemForm.controls['ErrorMessage'];
				reader.readAsDataURL(el.files[idx]);
				reader.onload = function () {
					let base64Str = reader.result as String;
					var metaIdx = base64Str.indexOf(';base64,');
					base64Str = base64Str.substr(metaIdx + 8); // Cắt meta data khỏi chuỗi base64
					var data = {
						fileName: fileName,
						base64: base64Str,
					};
					service.lastFileUpload$.next(data);
					service.uploadFile(data).subscribe(res => {
						if (res && res.status == 1) {
							service.data_import.next(res.data);
						}
						else {
							// service.lastFilterDSExcel$.next([]);
							// service.lastFilterInfoExcel$.next(undefined);

							a.setValue('');
							b.setValue(res.error.message);
							return;
						}
					});
				};
			}
			else {
				let inputs = new FormData();
				inputs.append('file', el.files[idx]);
			}
		}
	}
	luuImport() {
		if (this._dataImport.length > 0) {
			this.NguoiDungDPSsService.importFile(this._dataImport).subscribe(res => {
				if (res && res.status == 1) {
					this.isChange = true;
					this.itemForm.controls['FileDuLieu'].setValue('');
					this.itemForm.controls['ErrorMessage'].setValue('');
					this._dataImport = [];
					this.layoutUtilsService.showInfo('Import thành công!');
					this.dialogRef.close(this.isChange);
				}
				else {
					this.itemForm.controls['FileDuLieu'].setValue('');
					this.itemForm.controls['ErrorMessage'].setValue('');
					this._dataImport = [];
					this.layoutUtilsService.showError('Import thất bại, vui lòng kiểm tra lại file excel!');
				}
			});
		}
		else {
			this.layoutUtilsService.showError('Không có dữ liệu để import hoặc dữ liệu sai, vui lòng kiểm tra lại!');
			return;
		}
	}

	ImportFileMau() {
		this.NguoiDungDPSsService.downloadTemplate().subscribe(response => {
			const headers = response.headers;
			const filename = headers.get('x-filename');
			const type = headers.get('content-type');
			const blob = new Blob([response.body], { type });
			const fileURL = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = fileURL;
			link.download = filename;
			link.click();
		}, err => {
			this.layoutUtilsService.showError("Tải xuống file mẫu thất bại")
		});
	}
}
