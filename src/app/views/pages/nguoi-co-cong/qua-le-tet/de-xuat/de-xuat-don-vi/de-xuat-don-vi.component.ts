import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';
import { TokenStorage } from '../../../../../../core/auth/_services/token-storage.service';
import { MatDialog } from '@angular/material';
import { ReviewExportComponent } from '../../../components';
import { CommonService } from '../../../services/common.service';
import { DeXuatService } from '../Services/de-xuat.service';
import moment from 'moment';

@Component({
	selector: 'kt-de-xuat-don-vi',
	templateUrl: './de-xuat-don-vi.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class DeXuatDonViComponent implements OnInit {
	donvi: any;
	dataTreeDonVi: any[] = [];
	lstDotTangQua: any[] = [];
	CapCoCau: number = 0;
	idParent: number = 0;
	dot: number = 0;
	nam: number;
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();

	constructor(
		private changeDetect: ChangeDetectorRef,
		private commonService: CommonService,
		private tokenStorage: TokenStorage,
		private apiService: DeXuatService,
		public dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService) { }

	ngOnInit() {
		this.tokenStorage.getUserInfo().subscribe(res => {
			this.CapCoCau = res.Capcocau;
			this.idParent = res.ID_Goc;
			if (this.idParent == 0)
				this.idParent = res.ID_Goc_Cha;
		})
		this.GetTreeDonVi();
		this.changeNam();
	}

	changeNam() {
		this.dot = 0;
		this.commonService.liteDotQua(true, this.nam).subscribe(res => {
			if (res && res.status == 1)
				this.lstDotTangQua = res.data;
		})
	}

	GetTreeDonVi() {
		this.loadingSubject.next(true);
		this.dataTreeDonVi = [];
		this.commonService.GetTreeDonViHC(0, this.idParent).subscribe(res => {
			this.loadingSubject.next(false);
			let tree: any[] = [];
			if (res.data) {
				let i = 0;
				res.data.forEach((element: any) => {
					let item = element;
					if (i == 0) {
						item.anCss = {
							collapse: true,
							lastChild: false,
							state: 0, //trạng thái luôn luôn mở node này, 0 -> open, -1 -> close
							checked: false,
							parentChk: '',
							active: true
						}
					}
					else {
						item.anCss = {
							collapse: true,
							lastChild: false,
							state: 0, //trạng thái luôn luôn mở node này, 0 -> open, -1 -> close
							checked: false,
							parentChk: '',

						}
					}
					tree.push(item);
					i++;
				});
			}
			this.dataTreeDonVi = tree;
			this.changeDetect.detectChanges();
		});
	}

	treeDonViChanged(item: any) {
		if (item) 
			this.donvi = item.data;
	}

	checkAllowExport() {
		// Cũ: Nếu chọn "Tất cả" đợt hoặc đơn vị không phải cấp Huyện thì nút print bị ẩn.
		// return this.dot == 0 || this.donvi.Type != 'H';
		// Cũ: Nếu chọn "Tất cả" đợt hoặc đơn vị không phải cấp Xã thì nút print bị ẩn.
		return this.dot == 0 || this.donvi.Type != 'X';
	}

	In(mau = 1) {
		this.apiService.previewDeXuatDot(this.dot, this.donvi.ID_Goc, mau).subscribe(res => {
			if (res.status == 0) {
				this.layoutUtilsService.showError(res.error.message);
				return;
			}

			let dialogRef;
			if (mau > 1)
				dialogRef = this.dialog.open(ReviewExportComponent, { data: res.data, width: '1000px' });
			else
				dialogRef = this.dialog.open(ReviewExportComponent, { data: res.data });

			dialogRef.afterClosed().subscribe(res => {
				if (!res) return;

				this.apiService.exportDeXuatDot(this.dot, this.donvi.ID_Goc, mau, mau > 1, res.loai).subscribe(response => {
					if (response && response.body) {
						const headers = response.headers;
						const filename = headers.get('x-filename');
						const type = headers.get('content-type');
						const blob = new Blob([response.body], { type: type || undefined });
						const fileURL = URL.createObjectURL(blob);
						const link = document.createElement('a');
						link.href = fileURL;
						link.download = filename || '';
						link.click();
					}
				});
			})
		})
	}

	// capNhatSoQD() {
	// 	let data = { Id_DotTangQua: this.dot, Id_Huyen: this.donvi.ID_Goc, Huyen: this.donvi.GroupName };
	// 	let dialogRef = this.dialog.open(SoQuyetDinhComponent, { data: data });
	// 	dialogRef.afterClosed().subscribe(res => {
	// 		if (!res) {
	// 		} else {
	// 		}
	// 	});
	// }

	// InQD() {
	// 	this.apiService.previewQD(this.dot, this.donvi.ID_Goc).subscribe(res => {
	// 		if (res && res.status == 1) {
	// 			let dialogRef = this.dialog.open(ReviewExportComponent, { data: res.data });
	// 			dialogRef.afterClosed().subscribe(res => {
	// 				if (!res) {
	// 				} else {
	// 					this.apiService.exportQD(this.dot, this.donvi.ID_Goc, res.loai).subscribe(response => {
	// 						const headers = response.headers;
	// 						const filename = headers.get('x-filename');
	// 						const type = headers.get('content-type');
	// 						const blob = new Blob([response.body], { type });
	// 						const fileURL = URL.createObjectURL(blob);
	// 						const link = document.createElement('a');
	// 						link.href = fileURL;
	// 						link.download = filename;
	// 						link.click();
	// 					});
	// 				}
	// 			});
	// 		} else
	// 			this.layoutUtilsService.showError(res.error.message);
	// 	})
	// }
}