import { LayoutUtilsService } from 'app/core/_base/crud';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Component, OnInit, Inject } from '@angular/core';
import { PhatQuaModel } from './../Model/phat-qua.model';
import { PhatQuaService } from './../Services/phat-qua.service';

@Component({
	selector: 'kt-tang-qua-dialog',
	templateUrl: './tang-qua-dialog.component.html',
})
export class TangQuaDialogComponent implements OnInit {

	constructor(public dialogRef: MatDialogRef<TangQuaDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialog: MatDialog,
		public apiService: PhatQuaService,
		private layoutUtilsService: LayoutUtilsService) {
	}

	nguoinhan: string = '';
	dataNhanqua: any;
	sophieuchi = '';
	disabledBtn: boolean = false;
	
	ngOnInit() {
		this.dataNhanqua = this.data.ncc;
		this.nguoinhan = this.dataNhanqua.HoTen;
		this.LoadPhieuChi();
	}

	ThoiGianNhan: any;

	LoadPhieuChi() {
		this.ThoiGianNhan = new Date();
		this.apiService.Get_NextGift(this.dataNhanqua.Id).subscribe(res => {
			if (res && res.status == 1) {
				this.sophieuchi = res.data;
			}
		})
	}

	onSubmit() {
		const item = new PhatQuaModel();
		item.clear();
		item.Id_DeXuat = this.data.Id_DeXuat;
		item.Id_DeXuatTangQua_Detail = this.dataNhanqua.Id;
		item.SoPhieu = this.sophieuchi;
		item.NguoiNhan = this.nguoinhan;
		item.ThoiGianNhan = this.f_convertDatetime(this.ThoiGianNhan);
		if (this.nguoinhan == '') 
			this.layoutUtilsService.showError('Nhập thông tin người nhận quà')
		else 
			this.CreatePhieu(item);
	}

	f_convertDatetime(a: any) {
		return a.getFullYear() + "/" + ("0" + (a.getMonth() + 1)).slice(-2) + "/" + ("0" + (a.getDate())).slice(-2) + " "
			+ a.getHours() + ":" + a.getMinutes();
	}

	CreatePhieu(data: any) {
		this.apiService.Create(data).subscribe(res => {
			if (res && res.status == 1) 
				this.dialogRef.close(res.data);
			else
				this.layoutUtilsService.showError(res.error.message);
		})
	}

	closeDialog() {
		this.dialogRef.close();
	}
}