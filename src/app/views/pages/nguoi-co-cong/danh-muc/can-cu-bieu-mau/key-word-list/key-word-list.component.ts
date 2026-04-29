import { BieuMauService } from '../Services/bieu-mau.service';
import { MatDialogRef, MatPaginator, MatTableDataSource, MAT_DIALOG_DATA } from '@angular/material';
import { Component, OnInit, Inject, Input, ViewChild } from '@angular/core';
import { BieuMauQuaService } from '../Services/bieu-mau-qua.service';

@Component({
	selector: 'kt-key-word-list',
	templateUrl: './key-word-list.component.html',
})

export class KeyWordListComponent implements OnInit {
	@Input() IsFull: boolean = true;
	@Input() IsQua: boolean = false;

	item: any;
	keyword: string = '';
	_name = "Danh sách từ khóa";
	displayedColumns: string[] = ['stt', 'keys', 'desciption', 'format', 'default'];
	dataSource: MatTableDataSource<any> | undefined;
	@ViewChild("paginator", { static: true }) paginator: MatPaginator | undefined;

	constructor(public dialogRef: MatDialogRef<KeyWordListComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private danhmuckhacService: BieuMauService,
		private danhmucquaService: BieuMauQuaService) { }

	ngOnInit() {
		if (!this.IsQua)
			this.danhmuckhacService.getKey(this.keyword).subscribe(res => {
				if (res && res.status == 1) {
					this.dataSource = new MatTableDataSource(res.data);
					if (this.dataSource.paginator) 
						this.dataSource.paginator.firstPage();
					else if (this.paginator)
						this.dataSource.paginator = this.paginator;
				}
			})
		else
			this.danhmucquaService.getKey(this.keyword).subscribe(res => {
				if (res && res.status == 1) {
					this.dataSource = new MatTableDataSource(res.data);
					if (this.dataSource.paginator) 
						this.dataSource.paginator.firstPage();
					else if (this.paginator)
						this.dataSource.paginator = this.paginator;
				}
			})
	}

	close() {
		this.dialogRef.close();
	}

	filter() {
		this.ngOnInit()
	}
}