import { Component, OnInit, Inject, ChangeDetectionStrategy, ChangeDetectorRef, Type, HostListener } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService, TypesUtilsService } from '../../../../../../core/_base/crud';
import { TroCapService } from '../Services/tro-cap.service';
import { TroCapEditComponent } from '../../../components';

@Component({
	selector: 'kt-tro-cap-edit-dialog',
	templateUrl: './tro-cap-edit-dialog.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class TroCapEditDialogComponent implements OnInit {
	
	ChildComponentInstance: any;
	childComponentType: Type<any>;
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
		private typesUtilsService: TypesUtilsService,
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
		if (this.IsCat)
			return 'Thôi trả trợ cấp';
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
		if (EditTroCap == undefined) {
			this.changeDetectorRefs.detectChanges();
		}
		else {
			if (EditTroCap.Id > 0) {
				this.UpdateTroCap(EditTroCap, withBack);
			} else {
				this.CreateTroCap(EditTroCap, withBack);
			}
		}
	}
	UpdateTroCap(_item: any, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.objectService.Update(_item).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				if (withBack == true) {
					this.dialogRef.close({
						_item
					});
				} else {
					this.ngOnInit();
					const _messageType = this.translate.instant('OBJECT.EDIT.UPDATE_MESSAGE', { name: this._NAME });
					this.layoutUtilsService.showInfo(_messageType).afterDismissed().subscribe(tt => { });
				}
			} else {
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}
	CreateTroCap(_item: any, withBack: boolean) {
		this.loadingAfterSubmit = true;
		// 	this.viewLoading = true;
		this.disabledBtn = true;
		this.objectService.Create(_item).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				if (withBack == true) {
					this.dialogRef.close({
						_item
					});
				} else {
					const _messageType = this.translate.instant('OBJECT.EDIT.ADD_MESSAGE', { name: this._NAME });
					this.layoutUtilsService.showInfo(_messageType).afterDismissed().subscribe(tt => { });
					this.ngOnInit();
				}
			} else {
				this.viewLoading = false;
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	resizeDialog() {
		if (!this.isZoomSize) {
			this.dialogRef.updateSize('100vw', '100vh');
			this.isZoomSize = true;
		} else if (this.isZoomSize) {
			this.dialogRef.updateSize('900px', 'auto');
			this.isZoomSize = false;
		}
	}
	close() {
		this.dialogRef.close();
	}

	getInstance($event) {
		this.ChildComponentInstance = $event;
	}
	huyThoiTra() {
		const _title = this.translate.instant('OBJECT.DELETE.TITLE', { name: 'thôi trả trợ cấp' });
		const _description = this.translate.instant('OBJECT.DELETE.DESCRIPTION', { name: 'thôi trả trợ cấp' });
		const _waitDesciption = this.translate.instant('OBJECT.DELETE.WAIT_DESCRIPTION', { name: 'thôi trả trợ cấp' });
		const _deleteMessage = this.translate.instant('OBJECT.DELETE.MESSAGE', { name: 'Thôi trả trợ cấp' });

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.objectService.deleteItem(this.item.Id,true).subscribe(res => {
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
