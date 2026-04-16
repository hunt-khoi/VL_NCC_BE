import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { CommonService } from '../../../services/common.service';
import { TokenStorage } from '../../../../../../core/auth/_services/token-storage.service';
import { Moment } from 'moment';
import * as moment from 'moment';
import { QuyetDinhService } from '../Services/quyet-dinh.service';
import { ReviewDocxComponent } from '../../../components';

@Component({
	selector: 'kt-xuat-danh-sach',
	templateUrl: './xuat-danh-sach.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class XuatDanhSachComponent implements OnInit {

	// filter District
	filterprovinces: number;
	listprovinces: any[] = [];
	filterdistrict: number = 0;
	listdistrict: any[] = [];
	filterward: number = 0;
	loaids: number = 0
	loaidt: number = 0
	listward: any[] = [];
	lstStatus: any[] = [];
	lstLoaiDT: any[] = [];
	Capcocau: number;
	to: Moment;
	from: Moment;
	list_button: boolean;

	constructor(public objectService: QuyetDinhService,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private layoutUtilsService: LayoutUtilsService,
		private commonService: CommonService,
		private detechChange: ChangeDetectorRef,
		private tokenStorage: TokenStorage) {
	}

	/** LOAD DATA */
	ngOnInit() {
		let tmp = moment();
		let y = tmp.get("year");
		this.from = moment(new Date(y, 0, 1));
		this.to = moment(new Date(y, 11, 31));
		this.list_button = CommonService.list_button();

		this.commonService.liteDoiTuongNCC(false).subscribe(res => {
			if (res && res.status == 1) {
				this.lstLoaiDT = res.data;
				this.lstLoaiDT = this.lstLoaiDT.filter(x => x.id == 5 || x.id == 3 || x.id == 17)
				this.detechChange.detectChanges();
			}
		})

		this.tokenStorage.getUserInfo().subscribe(res => {
			this.filterprovinces = res.IdTinh;
			this.Capcocau = res.Capcocau;
			this.loadGetListDistrictByProvinces(this.filterprovinces);
			if (res.Capcocau == 3) {//xã
				this.filterdistrict = +res.ID_Goc_Cha;
				this.filterward = +res.ID_Goc;
				this.listward = [{
					Ward: res.DonVi,
					ID_Row: res.ID_Goc
				}];
			}
			if (res.Capcocau == 2) {
				this.filterdistrict = +res.ID_Goc_Cha;
				this.filterDistrictID(+res.ID_Goc_Cha)
			}
		})

		this.commonService.GetAllProvinces().subscribe(res => {
			this.listprovinces = res.data;
		});
	}

	checkDT(arr: any, id_dt: any) {
		let idx = arr.findIndex(x=> x.id == id_dt)
		if(idx > -1) return true
	}

	loadGetListDistrictByProvinces(idProvince: any) {
		this.commonService.GetListDistrictByProvinces(idProvince).subscribe(res => {
			this.listdistrict = res.data;
			this.detechChange.detectChanges();
		});
	}
	filterDistrictID(id: any) {
		this.filterdistrict = id;
		this.filterward = 0;
		this.commonService.GetListWardByDistrict(this.filterdistrict).subscribe(res => {
			if (res && res.status == 1)
				this.listward = res.data;
		})
	}

	filterConfiguration(loai): any {
		const filter: any = {};
		if (this.loaids == 0)
			this.layoutUtilsService.showError("Hãy chọn loại danh sách xuất");
		filter.loai = loai //loại xuất

		if (this.loaids == 1 || this.loaids == 3) { //ds thờ cúng hoặc truy tặng bà mẹ vnah
			var i = 0;
			if (this.filterdistrict > 0) {
				filter.DistrictID = +this.filterdistrict;
				i++;
			}
			if (this.filterward > 0) {
				filter.Id_Xa = +this.filterward;
				i++;
			}
			if (i == 0) {
				this.layoutUtilsService.showError("Hãy chọn Huyện/Xã");
				return;
			}
		}
		if (this.loaids == 2) { //ds khám
			if (this.loaidt == 0) {
				this.layoutUtilsService.showError("Hãy chọn loại đối tượng");
				return;
			}
			filter.LoaiDT = this.loaidt;
		}

		if (this.from)
			filter.TuNgay = this.from.format("DD/MM/YYYY");
		if (this.to)
			filter.DenNgay = this.to.format("DD/MM/YYYY");

		return filter;
	}

	xuatQD(loai) {
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(loai),
		);
		if (this.loaids == 1) {
			this.objectService.getDSThoCung(queryParams).subscribe(res => {
				if (res && res.status == 1) {
					const dialogRef = this.dialog.open(ReviewDocxComponent, { data: res.data });
					dialogRef.afterClosed().subscribe(res2 => {
						if (!res2) {
						} else {
							this.objectService.downloadDSThoCung(queryParams).subscribe(response => {
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
								this.layoutUtilsService.showError("Không tìm thấy danh sách thờ cúng");
							});
						}
					});
				} else
					this.layoutUtilsService.showError(res.error.message);
			});
		}
		if (this.loaids == 2) {
			this.objectService.getDSKham(queryParams).subscribe(res => {
				if (res && res.status == 1) {
					const dialogRef = this.dialog.open(ReviewDocxComponent, { data: res.data });
					dialogRef.afterClosed().subscribe(res2 => {
						if (!res2) {
						} else {
							this.objectService.downloadDSKham(queryParams).subscribe(response => {
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
								this.layoutUtilsService.showError("Không tìm thấy danh sách khám");
							});
						}
					});
				} else
					this.layoutUtilsService.showError(res.error.message);
			});
		}
		if (this.loaids == 3) {
			this.objectService.getTruyTangBMVNAH(queryParams).subscribe(res => {
				if (res && res.status == 1) {
					const dialogRef = this.dialog.open(ReviewDocxComponent, { data: res.data });
					dialogRef.afterClosed().subscribe(res2 => {
						if (!res2) {
						} else {
							this.objectService.downloadTruyTangBMVNAH(queryParams).subscribe(response => {
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
								this.layoutUtilsService.showError("Không tìm thấy danh sách truy tặng BMVNAH");
							});
						}
					});
				} else
					this.layoutUtilsService.showError(res.error.message);
			});
		}
			
	}
}
