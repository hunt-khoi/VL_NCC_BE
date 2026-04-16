import { Component, OnInit, Inject, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSort, MatTableDataSource } from '@angular/material';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';
import { DeXuatModel } from '../Model/de-xuat.model';
import { DeXuatService } from '../Services/de-xuat.service';

@Component({
	selector: 'm-dot-tang-qua-duyet-dialog',
	templateUrl: './dot-tang-qua-duyet.dialog.component.html',
})

export class dottangquaDuyetDialogComponent implements OnInit {
	item: DeXuatModel;
	oldItem: DeXuatModel
	itemForm: FormGroup;
	hasFormErrors: boolean = false;
	viewLoading: boolean = false;
	filterDonVi: string = '';
	listNhomLeTet: any[] = [];
	listNCC: any[] = [];
	listMucQua: any[] = [];

	NCC_MQs: any[] = [];
	datasource: MatTableDataSource<any>;

	details: any[] = [];
	displayedColumns = ['STT', 'Id_NCC', 'HoTen', 'DiaChi', 'SoTien', 'DoiTuong', 'MucQua'];
	displayedColumns1 = ['STT', 'NguoiCoCong', 'MucQua', 'action'];

	loadingAfterSubmit: boolean = false;
    disabledBtn: boolean = false;
	allowEdit: boolean = true; //cho phép sửa
	allowDetail: boolean = false;
	isZoomSize: boolean = false;
	@ViewChild("focusInput", { static: true }) focusInput: ElementRef;
	@ViewChild('sort1', { static: true }) sort: MatSort;

	_name = "";
	
	constructor(public dialogRef: MatDialogRef<dottangquaDuyetDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		private danhMucService: CommonService,
		public dottangquaService: DeXuatService,
		private changeDetectorRefs: ChangeDetectorRef,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService) {
		this._name = this.translate.instant("DOT_TANG_QUA.NAME");
	}

	/** LOAD DATA */
	ngOnInit() {
		this.item = this.data._item; 

		this.createForm();
		if (this.item.Id > 0) { 
			this.viewLoading = true;
			this.dottangquaService.getItem(this.item.Id).subscribe(res => {
				this.viewLoading = false;
				this.changeDetectorRefs.detectChanges();
				if (res && res.status == 1) {
					this.item = res.data;
					this.createForm();
				}
				else
					this.layoutUtilsService.showError(res.error.message);
			});
		}
	}

	createForm() {
		this.itemForm = this.fb.group({
			GhiChu: [],
        });
		this.itemForm.controls["GhiChu"].markAsTouched();
        
		if (!this.allowEdit) //false thì không cho sửa
			this.itemForm.disable();
	}
	
	/** UI */
	getTitle(): string {
		let result = this.translate.instant('DOT_TANG_QUA.DUYET');
		return result;
	}

	/** ACTIONS */
	prepareCustomer(): any {
		const controls = this.itemForm.controls;
		const _item: any = {};
		_item.Id = this.item.Id;
		_item.note = controls['GhiChu'].value; 
		return _item;
	}

	onSubmit(duyet: boolean) {

		this.hasFormErrors = false;
		this.loadingAfterSubmit = false;

		const DuyetDot = this.prepareCustomer();
		this.DuyetDotTangQua(DuyetDot, duyet)
	}

	closeForm() {
		this.dialogRef.close();
	}

	DuyetDotTangQua(_item: any, value: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;

		let _title = '';
		let _description = '';
		let _waitDesciption = 'Đang xử lý...';

		if(value == true){
			_title = 'Duyệt đợt tặng quà';
			_description = 'Bạn có chắc muốn duyệt đợt tặng quà này ??';
		}
		else{
			_title = 'Không duyệt đợt tặng quà';
			_description = 'Bạn có chắc không muốn duyệt đợt tặng quà này ??';
		}

        const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
        dialogRef.afterClosed().subscribe(res => {
            if (!res) {
                return;
            }

			this.dottangquaService.duyetDotTangQua(_item.Id, value, _item.note).subscribe(res => {
				this.changeDetectorRefs.detectChanges();
				if (res && res.status === 1) {
					const _messageType = this.translate.instant('OBJECT.EDIT.ADD_MESSAGE', { name: this._name });
					this.layoutUtilsService.showInfo(_messageType).afterDismissed().subscribe(tt => {});
					this.dialogRef.close({
						_item
					});
				}
				else {
					this.viewLoading = false;
					this.layoutUtilsService.showError(res.error.message);
				}
			});
        });
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

	close() {
		this.dialogRef.close();
	}
}
