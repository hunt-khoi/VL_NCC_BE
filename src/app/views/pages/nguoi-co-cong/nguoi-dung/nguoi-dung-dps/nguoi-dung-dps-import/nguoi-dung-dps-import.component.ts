import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
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
	@ViewChild('fileUpload', { static: true }) fileUpload: any;
	NguoiDungDPS: NguoiDungDPSModel = new NguoiDungDPSModel();
	itemForm: FormGroup | undefined;
	hasFormErrors: boolean = false;
	loadingSubject = new BehaviorSubject<boolean>(true);
	loading$: Observable<boolean> | undefined;
	viewLoading: boolean = false;
	isChange: boolean = false;
	_soLanImport: number = 0;
	_dataImport: any[] = [];
	HTMLStr:string='';
	disabledBtn: boolean = false;
	private componentSubscriptions: Subscription | undefined;

	constructor(
		public dialogRef: MatDialogRef<NguoiDungDPSImportComponent>,
		private itemFB: FormBuilder,
		public dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private apiService: NguoiDungDPSService) {}

	ngOnInit() {
		this.viewLoading = false;
		this.apiService.data_import.subscribe(res => {
			this._dataImport = [...res];
		});
		this.createForm();
	}

	ngOnDestroy() {
		if (this.componentSubscriptions) {
			this.componentSubscriptions.unsubscribe();
		}
		this.apiService.data_import.next([]);
	}

	createForm() {
		this.itemForm = this.itemFB.group({
			FileDuLieu: [''],
			ErrorMessage: [''],
		});
	}

	numberOnly(event: any): boolean {
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
		if (!this.itemForm) return;
		this.itemForm.controls['ErrorMessage'].setValue('');
		let el: HTMLInputElement = this.fileUpload.nativeElement as HTMLInputElement;
		el.type = "text";
		el.type = "file";
		el.click();
	}

	FileSelected(evt: any) {
		if (!this.itemForm) return;
		if (evt.target.files && evt.target.files.length) {//Nếu có file
			let file = evt.target.files[0]; // Ví dụ chỉ lấy file đầu tiên
			let fileName = file.name;
			var res = fileName.match(/.xls$|.xlsx$/g);
			if (!res) {
				this.layoutUtilsService.showError('File không hợp lệ');
				return;
			}
			if (!res["includes"]('.xlsx') && !res["includes"]('.xls')) {
				this.layoutUtilsService.showError('File không hợp lệ.');
				return;
			}
			else {
				this.itemForm.controls['FileDuLieu'].patchValue(fileName); // Set value cho control dùng để validate (trường hợp base64)
				this.DocDuLieu();
			}
		}
		else { //Không có file
			this.itemForm.controls['FileDuLieu'].patchValue('');
		}
	}

	checkDataIsValid(): boolean {
		if (!this.itemForm) return false;
		// Kiểm tra Form Control 'FileDuLieu' có tồn tại và hợp lệ không
		const fileControl = this.itemForm.controls['FileDuLieu'];
		const isControlValid = fileControl && fileControl.valid;
		// Kiểm tra thẻ input HTML xem đã có file được chọn chưa
		const fileInput = document.getElementById("fileUploadExcel") as HTMLInputElement;
		let hasSelectedFile = false;
		if (fileInput && fileInput.type === 'file') {
			if (fileInput.files && fileInput.files.length > 0) {
				hasSelectedFile = true;
			}
		}
		return isControlValid && hasSelectedFile;
	}

	DocDuLieu() {
		let t = this.checkDataIsValid();
		if (t) this.Importfile();
		else this.layoutUtilsService.showError("Mời chọn file");
	}

	Importfile() {
		if (!this.itemForm) return;
		let el: any = this.fileUpload.nativeElement;
		var service = this.apiService;
		var useBase64: boolean = true;
		for (var idx = 0; idx < el.files.length; idx++) {
			if (useBase64) {
				var fileName = el.files[idx].name;
				let reader = new FileReader();
				var a = this.itemForm.controls['FileDuLieu'];
				var b = this.itemForm.controls['ErrorMessage'];
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
		if (this._dataImport.length <= 0) {
			this.layoutUtilsService.showError('Không có dữ liệu để import hoặc dữ liệu sai, vui lòng kiểm tra lại!');
			return;
		}
		this.apiService.importFile(this._dataImport).subscribe(res => {
			if (!this.itemForm) return;
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

	ImportFileMau() {
		this.apiService.downloadTemplate().subscribe(response => {
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