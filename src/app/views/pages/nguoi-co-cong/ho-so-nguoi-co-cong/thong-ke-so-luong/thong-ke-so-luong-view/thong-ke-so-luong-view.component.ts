import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material';
import { BehaviorSubject } from 'rxjs';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';
import { TokenStorage } from '../../../../../../core/auth/_services/token-storage.service';
import { ThongKeSoLuongService } from '../Services/thong-ke-so-luong.service';
import { ChiTietThongKeComponent } from './../chi-tiet-thong-ke/chi-tiet-thong-ke.component';
import { Moment } from 'moment';

@Component({
	selector: 'kt-thong-ke-so-luong-view',
	templateUrl: './thong-ke-so-luong-view.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class ThongKeSoLuongViewComponent implements OnInit {

	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	viewLoading: boolean = false;
	loadingAfterSubmit: boolean = false;
	now = new Date();
	to: Moment | undefined;
	from: Moment | undefined;
	loai: string = '0';
	dataThongKe: any[] = [];
	filterdistrict: string = "";
	listdistrict: any[] = [];
	Capcocau: number = 0;
	@ViewChild('printme', {static: true}) printme: ElementRef | undefined;

	constructor(public service: ThongKeSoLuongService,
		private CommonService: CommonService,
		public dialog: MatDialog,
		private changeDetectorRefs: ChangeDetectorRef,
		private layoutUtilsService: LayoutUtilsService,
		private tokenStorage: TokenStorage,
		private translate: TranslateService) {
	}

	/** LOAD DATA */
	ngOnInit() {
		// let tmp = moment();
		// tmp = tmp.set('date', 1);
		// this.from = tmp;
		// this.to = moment();
		this.tokenStorage.getUserInfo().subscribe(res => {
			this.Capcocau = +res.Capcocau
			if (res.Capcocau == 1) {
				this.CommonService.GetListDistrictByProvinces(res.IdTinh).subscribe(res => {
					this.listdistrict = res.data;
					this.changeDetectorRefs.detectChanges();
				});
			}
			this.changeDetectorRefs.detectChanges();
		})
		this.loadDataList();
	}

	filterConfiguration(): any {
		const filter: any = {};
		if (!this.loai) {
			this.layoutUtilsService.showError("Vui lòng chọn loại thống kê");
			return;
		}
		if (this.from)
			filter["TuNgay"] = this.from.format("DD/MM/YYYY");
		if (this.to)
			filter["DenNgay"] = this.to.format("DD/MM/YYYY");
		filter["loai"] = this.loai;
		filter["DistrictID"] = this.filterdistrict;
		return filter;
	}

	print(){
		if (this.printme) {
			const printme = this.printme.nativeElement as HTMLElement;
			printme.click();
		}
	}

	loadDataList() {
		this.dataThongKe = [];
		this.loadingSubject.next(true);
		this.viewLoading = true;
		this.service.findData(this.filterConfiguration()).subscribe(res => {
			this.loadingSubject.next(false);
			if (res && res.status == 1) {
				this.dataThongKe = res.data;
				this.dataThongKe.length==0
			}
			else
				this.layoutUtilsService.showError(res.error.message);
			this.viewLoading = false;
			this.changeDetectorRefs.detectChanges();
		})
	}
	
	export() {
		let queryParams = this.filterConfiguration();
		this.service.exportList(queryParams).subscribe(response => {
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
			this.layoutUtilsService.showError("Xuất thống kê không thành công");
		});
	}

	xem(item: any, status: any, IdParent: number = 0) {
		var loai = this.loai;
		const dialogRef = this.dialog.open(ChiTietThongKeComponent, { 
			width:'90vw',
			data: { item, status, IdParent, loai } 
		});
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
			}
		});
	}
}