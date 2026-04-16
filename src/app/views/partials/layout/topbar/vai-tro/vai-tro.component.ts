import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Subscription } from 'rxjs';
import { LayoutUtilsService } from 'app/core/_base/crud';
import { AuthService } from '../../../../../core/auth';
import { TokenStorage } from '../../../../../core/auth/_services/token-storage.service';

@Component({
	selector: 'kt-vai-tro',
	templateUrl: './vai-tro.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class VaiTroComponent implements OnInit, OnDestroy {
	// Public properties
	isZoomSize: boolean = false;
	ListVaiTro: any[] = [];
	private componentSubscriptions: Subscription | undefined;
	displayedColumns: string[] = ['STT', 'VaiTro', 'DonVi'];
	disabledBtn: boolean=false;
	viewLoading: boolean=false;

	constructor(
		public dialogRef: MatDialogRef<VaiTroComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService,
		private auth: AuthService,
		private tokenStorage: TokenStorage) { }


	async ngOnInit() {
		if (this.data && this.data.VaiTros)
			this.ListVaiTro = this.data.VaiTros;
	}

	ngOnDestroy() {
		if (this.componentSubscriptions) {
			this.componentSubscriptions.unsubscribe();
		}
	}

	update(item: any) {
		if (item.InUse) return;
		this.auth.doiVaiTro(item.IdGroup).subscribe(res => {
			if (res && res.status == 1) {
				res.data.Token = res.data.ResetToken;
				this.tokenStorage.updateStorage(res.data);
				window.location.reload();
			}
			else {
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	closeDialog() {
		this.dialogRef.close();
	}
	
	resizeDialog() {
		if (!this.isZoomSize) {
			this.dialogRef.updateSize('100vw', '100vh');
			this.isZoomSize = true;
		}
		else if (this.isZoomSize) {
			this.dialogRef.updateSize('900px', 'auto');
			this.isZoomSize = false;
		}

	}
}