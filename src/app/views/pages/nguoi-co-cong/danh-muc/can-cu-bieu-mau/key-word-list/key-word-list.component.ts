import { BieuMauService } from './../services/bieu-mau.service';
import { MatDialogRef, MatPaginator, MatTableDataSource, MAT_DIALOG_DATA } from '@angular/material';
import { Component, OnInit, Inject, Input, AfterViewInit, ViewChild } from '@angular/core';
import { BieuMauQuaService } from '../services/bieu-mau-qua.service';

@Component({
	selector: 'kt-key-word-list',
	templateUrl: './key-word-list.component.html',
})

export class KeyWordListComponent implements OnInit, AfterViewInit {
	@Input() IsFull: boolean = true;
	@Input() IsQua: boolean = false;
	item: any;
	keyword: string = '';
	_name = "Danh sách từ khóa";
	displayedColumns: string[] = ['stt', 'keys', 'desciption', 'format', 'default'];
	dataSource: MatTableDataSource<any>;
	@ViewChild("paginator", { static: true }) paginator: MatPaginator;

	constructor(public dialogRef: MatDialogRef<KeyWordListComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private danhmuckhacService: BieuMauService,
		private danhmucquaService: BieuMauQuaService,
	) { }

	ngOnInit() {
		if (!this.IsQua)
			this.danhmuckhacService.getKey(this.keyword).subscribe(res => {
				if (res && res.status == 1) {
					this.dataSource = new MatTableDataSource(res.data);
					if (this.dataSource.paginator) {
						this.dataSource.paginator.firstPage();
					} else
						this.dataSource.paginator = this.paginator;
				}
			})
		else
			this.danhmucquaService.getKey(this.keyword).subscribe(res => {
				if (res && res.status == 1) {
					this.dataSource = new MatTableDataSource(res.data);
					if (this.dataSource.paginator) {
						this.dataSource.paginator.firstPage();
					} else
						this.dataSource.paginator = this.paginator;
				}
			})
	}

	ngAfterViewInit() {
		//this.dataSource.paginator = this.paginator;
	}
	close() {
		this.dialogRef.close();
	}
	filter() {
		this.ngOnInit()
	}
}
