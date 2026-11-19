import { Component, OnInit, Inject, ChangeDetectorRef, HostListener, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';
import { TokenStorage } from 'app/core/auth/_services/token-storage.service';
import { FormDonVi } from '../Model/detail-list.model';
import { MauSoLieuModel } from './../Model/mau-so-lieu.model';
import { MauSoLieuService } from '../Services/mau-so-lieu.service';
import { SoLuongGiaoDialogComponent } from '../so-luong-giao/so-luong-giao-dialog.component';
import { MauSoLieuDonViDialogComponent } from '../mau-so-lieu-don-vi/mau-so-lieu-don-vi-dialog.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
	selector: 'kt-mau-so-lieu-giao-dialog',
	templateUrl: './mau-so-lieu-giao-dialog.component.html',
})

export class MauSoLieuGiaoDialogComponent implements OnInit, OnDestroy {
	private destroy$ = new Subject<void>();
	item: any;
	viewLoading = false;
	loadingAfterSubmit = false;
	disabledBtn = false;
	isZoomSize = false;
	ListGiao: Array<any> = [];
	IdDonVi: number = 0;
	list_button: boolean = false;
	Capcocau : number = 0;
	btnClass: string = "";

	/* Keyboard Shortcut Keys */
	@HostListener('document:keydown', ['$event'])
	onKeydownHandler(event: KeyboardEvent) {
		if (event.altKey && event.key === 'Enter') { 
			this.giao();
		}
	}

	constructor(public dialogRef: MatDialogRef<MauSoLieuGiaoDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private objectService: MauSoLieuService,
		private translate: TranslateService,
		private tokenStorage: TokenStorage ) { }

	ngOnInit() {
		this.list_button = CommonService.list_button();
		this.btnClass = this.list_button ? 'mat-raised-button' : 'mat-icon-button';
		this.item = this.data._item;
		this.objectService.listGiao(this.item.Id).pipe(takeUntil(this.destroy$)).subscribe(res => {
			if (res && res.status == 1) {
				this.IdDonVi = res.dataExtra.IdDonVi;
				this.ListGiao = res.data;
			}
		})
		this.tokenStorage.getUserInfo().pipe(takeUntil(this.destroy$)).subscribe(res => {
			this.Capcocau = res.Capcocau;
		})
	}

	ngOnDestroy() {
		this.destroy$.next();
		this.destroy$.complete();
	}

	/** UI */
	getTitle(): string {
		return this.translate.instant('MAU_SO_LIEU.caclangiao') + ' - ' + this.item.MauSoLieu;
	}

	giao() {
		let item: FormDonVi = new FormDonVi();
		item.clear();
		item.Id_MauSoLieu = this.item.Id;
		this.EditObject(item);
	}

	EditObject(object: any) {
		const dialogRef = this.dialog.open(MauSoLieuDonViDialogComponent, { data: 
			{ _item: object, IdDonVi: this.IdDonVi, IsMauTheoPhong: this.item.IsMauTheoPhong } 
		});
		dialogRef.afterClosed().subscribe(res => {
			if (res)
				this.ngOnInit();
		});
	}

	viewGiao(object: any) {
		const dialogRef = this.dialog.open(SoLuongGiaoDialogComponent, { data: 
			{ _item: object, IdDonVi: this.IdDonVi, IsMauTheoPhong: this.item.IsMauTheoPhong } 
		});
		dialogRef.afterClosed().subscribe(res => {
			if (res)
				this.ngOnInit();
		});
	}

	DeleteWorkplace(_item: MauSoLieuModel) {
		const _title = this.translate.instant('OBJECT.DELETE.TITLE', { name: "lần giao" });
		const _description = this.translate.instant('OBJECT.DELETE.DESCRIPTION', { name: "lần giao" });
		const _waitDesciption = this.translate.instant('OBJECT.DELETE.WAIT_DESCRIPTION', { name: "lần giao" });
		const _deleteMessage = this.translate.instant('OBJECT.DELETE.MESSAGE', { name: "Lần giao" });
		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) return;
			
			this.objectService.deleteGiao(_item.Id).pipe(takeUntil(this.destroy$)).subscribe(res => {
				if (res && res.status === 1) {
					this.layoutUtilsService.showInfo(_deleteMessage);
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
				this.ngOnInit();
			});
		});
	}

	NhacNho(_item: any) {
		let lstDV = _item.ListDonVi.filter((x: any) => !x.IsNhap).map((x: any) => x.Id);
		this.objectService.nhacNhoNhap(_item.Id, lstDV).pipe(takeUntil(this.destroy$)).subscribe(res => {
			if (res && res.status === 1) {
				this.layoutUtilsService.showInfo("Nhắc nhở nhập số liệu thành công");
			} else {
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	close() {
		this.dialogRef.close();
	}

	getStringDate(datetime: string) {
		let strdate = '';

		if ('-' == datetime.charAt(4)) {
			strdate = datetime.slice(8, 10);
			strdate = strdate + '/';
			strdate = strdate + datetime.slice(5, 7);
			strdate = strdate + '/';
			strdate = strdate + datetime.slice(0, 4);
			return strdate;
		}
		return datetime.slice(0, 10);
	}

	getColorProgressBar(pt: number) {
		if (pt < 30) 
			return 'danger';
		else if (pt >= 30 && pt < 80) 
			return 'warning';
		else 
			return 'success';
	}

	getColor(pt: number) {
		if (pt < 30) 
			return 'red';
		else if (pt >= 30 && pt < 80) 
			return 'orange';
		else 
			return 'green';
	}
}