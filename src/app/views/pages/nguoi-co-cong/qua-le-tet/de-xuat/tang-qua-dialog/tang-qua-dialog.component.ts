import { PhatQuaModel } from './../Model/phat-qua.model';
import { PhatQuaService } from './../Services/phat-qua.service';
import { TranslateService } from '@ngx-translate/core';
import { LayoutUtilsService, MessageType } from 'app/core/_base/crud';
import { CommonService } from 'app/views/pages/nguoi-co-cong/services/common.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';

@Component({
	selector: 'kt-tang-qua-dialog',
	templateUrl: './tang-qua-dialog.component.html',
})
export class TangQuaDialogComponent implements OnInit {

	constructor(public dialogRef: MatDialogRef<TangQuaDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialog: MatDialog,
		private danhMucService: CommonService,
		public PhatQuaService: PhatQuaService,
		private changeDetectorRefs: ChangeDetectorRef,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService) {
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
		this.PhatQuaService.Get_NextGift(this.dataNhanqua.Id).subscribe(res => {
			if (res && res.status == 1) {
				this.sophieuchi = res.data;
			}
		})
	}

	onSubmit() {
		const PhatQua = new PhatQuaModel();
		PhatQua.clear();

		PhatQua.Id_DeXuat = this.data.Id_DeXuat;
		PhatQua.Id_DeXuatTangQua_Detail = this.dataNhanqua.Id;
		PhatQua.SoPhieu = this.sophieuchi;
		PhatQua.NguoiNhan = this.nguoinhan;
		PhatQua.ThoiGianNhan = this.f_convertDatetime(this.ThoiGianNhan);
		if (this.nguoinhan == '') 
			this.layoutUtilsService.showError('Nhập thông tin người nhận quà')
		else 
			this.CreatePhieu(PhatQua);
	}

	f_convertDatetime(a) {
		return a.getFullYear() + "/" + ("0" + (a.getMonth() + 1)).slice(-2) + "/" + ("0" + (a.getDate())).slice(-2) + " "
			+ a.getHours() + ":" + a.getMinutes();
	}

	CreatePhieu(data) {
		this.PhatQuaService.Create(data).subscribe(res => {
			if (res && res.status == 1) {
				this.dialogRef.close(
					res.data
				);
			} else
				this.layoutUtilsService.showError(res.error.message);
		})
	}

	closeDialog() {
		this.dialogRef.close();
	}

}
