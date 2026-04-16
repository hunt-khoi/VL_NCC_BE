// Angular
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
// Services
import { ThongKeHoTroService } from '../Services/thong-ke-ho-tro.service';
import { CommonService } from '../../../services/common.service';

@Component({
	selector: 'kt-thong-ke-tong-hop-dialog',
	templateUrl: './thong-ke-tong-hop-dialog.component.html',
})
export class ThongKeTongHopDialogComponent implements OnInit {

	displayedColumns = ['STT', 'DoiTuong', 'SoLuong', 'ChiPhiYeuCau', 'SoTienHoTro'];
	_name = '';
	_item: any;
	datatest: any[] = [];
	tsSeparator: string;

	constructor(
		public dialogRef: MatDialogRef<ThongKeTongHopDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		public objectService: ThongKeHoTroService,
		public dialog: MatDialog,
		public commonServices: CommonService,
		public changeDetector: ChangeDetectorRef) {
			this._name = 'Chi tiết thống kê theo đối tượng';
	}

	/** LOAD DATA */
	ngOnInit() {
		this._item = this.data;
		this.tsSeparator = this.commonServices.thousandSeparator;
		if (this._item.loaitkCT == 0) {
			this.displayedColumns = this.displayedColumns.slice(0, 3);
		} else if (this._item.loaitkCT == 1) {
			this.displayedColumns.pop();
		} else if (this._item.loaitkCT == 2) {
			this.displayedColumns.splice(3,1);
		}
		this.loadData();
	}

	ngAfterViewChecked() {
		//chặn lỗi ExpressionChangedAfterItHasBeenCheckedError
		this.changeDetector.detectChanges();
	}

	loadData(){
		this.objectService.thongKeChiTietTH(this._item.queryParams, this._item.loaitk).subscribe(res => {
			if (res && res.status == 1)
				this.datatest = res.data;
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
