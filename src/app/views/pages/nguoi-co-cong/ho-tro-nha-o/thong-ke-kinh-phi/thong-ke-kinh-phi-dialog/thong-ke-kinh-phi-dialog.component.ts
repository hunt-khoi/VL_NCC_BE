import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { ThongKeKinhPhiService } from '../Services/thong-ke-kinh-phi.service';
import { QueryParamsModel } from 'app/core/_base/crud';
import { CommonService } from '../../../services/common.service';

@Component({
	selector: 'kt-thong-ke-kinh-phi-dialog',
	templateUrl: './thong-ke-kinh-phi-dialog.component.html',
})
export class ThongKeKinhPhiDialogComponent implements OnInit {

	displayedColumns = ['STT', 'SoHoSo', 'HoTen', 'Xa', 'Huyen', 'HinhThuc', 'ChiPhiYeuCau', 'SoTien', 'CapHoTro' ];
	_name = '';
	item: any;
	dataTK: any[] = [];
	tsSeparator: string;

	constructor(
		public dialogRef: MatDialogRef<ThongKeKinhPhiDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		public objectService: ThongKeKinhPhiService,
		public dialog: MatDialog,
		public commonServices: CommonService,
		public changeDetector: ChangeDetectorRef) {
			this._name = 'Chi tiết thống kê hồ sơ';
	}

	/** LOAD DATA */
	ngOnInit() {
		this.item = this.data;
		this.tsSeparator = this.commonServices.thousandSeparator;
		this.loadData();
	}

	ngAfterViewChecked() {
		//chặn lỗi ExpressionChangedAfterItHasBeenCheckedError
		this.changeDetector.detectChanges();
	}

	loadData(){
		this.objectService.thongKeChiTiet(this.item.queryParams).subscribe(res => {
			if (res && res.status == 1)
				this.dataTK = res.data;			
		})
	}

	getHeight(): any {
		const obj = window.location.href.split('/').find(x => x == 'tabs-references');
		if (obj) {
			let tmp_height = 0;
			tmp_height = window.innerHeight - 354;
			return tmp_height + 'px';
		} else {
			let tmp_height = 0;
			tmp_height = window.innerHeight - 236;
			return tmp_height + 'px';
		}
	}

	close() {
		this.dialogRef.close();
	}
	
}
