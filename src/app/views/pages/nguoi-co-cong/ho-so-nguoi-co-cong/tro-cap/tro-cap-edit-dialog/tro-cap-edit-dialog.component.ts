import { Component, OnInit, Inject, ChangeDetectionStrategy, ChangeDetectorRef, Type, HostListener } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';
import { TroCapService } from '../Services/tro-cap.service';
import { TroCapEditComponent } from '../../../components';

@Component({
	selector: 'kt-tro-cap-edit-dialog',
	templateUrl: './tro-cap-edit-dialog.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class TroCapEditDialogComponent implements OnInit {
	ChildComponentInstance: any;
	childComponentType: Type<any> | any;
	childComponentData: any = {};
	item: any;
	viewLoading = false;
	loadingAfterSubmit = false;
	disabledBtn = false;
	isZoomSize = false;
	allowEdit = false;
	IsCat = false;
	isTruyLinh: boolean = false;
	_NAME = '';

	/* Keyboard Shortcut Keys */
	@HostListener('document:keydown', ['$event'])
	onKeydownHandler(event: KeyboardEvent) {
		// lưu đóng
		if (event.altKey && event.keyCode == 13) { //phím Enter
			this.onSubmit(true);
		}
		//lưu tiếp tục
		if (event.ctrlKey && event.keyCode == 13) { //phím Enter
			this.onSubmit(false);
		}
	}

	constructor(
		public dialogRef: MatDialogRef<TroCapEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		public commonService: CommonService,
		private objectService: TroCapService,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private translate: TranslateService) {
			this._NAME = this.translate.instant('TROCAP.NAME');
	}

	/** LOAD DATA */
	ngOnInit() {
		if (this.data.allowEdit != undefined)
			this.allowEdit = this.data.allowEdit;
		if (this.data.IsCat != undefined)
			this.IsCat = this.data.IsCat;
		this.item = this.data._item;
		this.childComponentType = TroCapEditComponent;
		this.childComponentData = Object.assign({}, this.data);
		this.childComponentData.objectService = this.objectService;
		this.changeDetectorRefs.detectChanges();
	}

	/** UI */
	getTitle(): string {
		if (this.IsCat) return 'Thôi trả trợ cấp';
		let result = this.translate.instant('COMMON.CREATE');
		if (!this.allowEdit) {
			result = 'Xem chi tiết';
			return result;
		}
		if (!this.item || !this.item.Id) {
			return result;
		}
		result = this.translate.instant('COMMON.UPDATE');
		return result + " " + this._NAME;
	}

	onSubmit(withBack: boolean = false) {
		let EditTroCap = this.ChildComponentInstance.onSubmit();
		if (EditTroCap) {
			if (EditTroCap.Id > 0) {
				this.UpdateTroCap(EditTroCap, withBack);
			} else {
				this.CreateTroCap(EditTroCap, withBack);
			}
		}
	}

	UpdateTroCap(item: any, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.objectService.Update(item).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				if (withBack == true) {
					this.dialogRef.close({
						item
					});
				} else {
					this.ngOnInit();
					const _messageType = this.translate.instant('OBJECT.EDIT.UPDATE_MESSAGE', { name: this._NAME });
					this.layoutUtilsService.showInfo(_messageType);
				}
			} else {
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	CreateTroCap(item: any, withBack: boolean) {
		this.loadingAfterSubmit = true;
		// 	this.viewLoading = true;
		this.disabledBtn = true;
		this.objectService.Create(item).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				if (withBack == true) {
					this.dialogRef.close({
						item
					});
				} else {
					const _messageType = this.translate.instant('OBJECT.EDIT.ADD_MESSAGE', { name: this._NAME });
					this.layoutUtilsService.showInfo(_messageType);
					this.ngOnInit();
				}
			} else {
				this.viewLoading = false;
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	close() {
		this.dialogRef.close();
	}

	getInstance($event: any) {
		this.ChildComponentInstance = $event;
	}

	huyThoiTra() {
		const _title = this.translate.instant('OBJECT.DELETE.TITLE', { name: 'thôi trả trợ cấp' });
		const _description = this.translate.instant('OBJECT.DELETE.DESCRIPTION', { name: 'thôi trả trợ cấp' });
		const _waitDesciption = this.translate.instant('OBJECT.DELETE.WAIT_DESCRIPTION', { name: 'thôi trả trợ cấp' });
		const _deleteMessage = this.translate.instant('OBJECT.DELETE.MESSAGE', { name: 'Thôi trả trợ cấp' });
		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) return;
			
			this.objectService.Delete(this.item.Id,true).subscribe(res => {
				if (res && res.status === 1) {
					this.layoutUtilsService.showInfo(_deleteMessage);
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
				this.dialogRef.close(true);
			});
		});
	}
}