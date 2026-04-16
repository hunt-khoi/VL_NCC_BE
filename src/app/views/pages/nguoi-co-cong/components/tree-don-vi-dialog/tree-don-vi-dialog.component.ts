import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import {  MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { DM_DonViService } from '../../danh-muc/dm-don-vi/Services/dm-don-vi.service';

@Component({
	selector: 'kt-tree-don-vi-dialog',
	templateUrl: './tree-don-vi-dialog.component.html',
})
	
export class TreeDonViDialogComponent implements OnInit, OnDestroy {
	// Public properties
	DM_YKienForm: FormGroup | undefined;
	hasFormErrors: boolean = false;
	disabledBtn:boolean=false;
	loadingSubject = new BehaviorSubject<boolean>(true);
	loading$: Observable<boolean> | undefined;
	viewLoading: boolean = false;
	isChange: boolean = false;
	donvi: string = "";
	dataTreeDonVi: any[] = [];
	componentSubscriptions: Subscription | undefined;

	constructor(
		public dialogRef: MatDialogRef<TreeDonViDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,		
		public dialog: MatDialog,
		private service: DM_DonViService) {}


	async ngOnInit() {
		this.GetTreeDonVi();
	}

	GetTreeDonVi() {
		this.viewLoading = true;
		this.service.GetTreeDonVi().subscribe(res => {
			// res.data.anCss= {
			// 	collapse: true,
			// 	lastChild: false,
			// 	state: 0,//trạng thái luôn luôn mở node này, 0 -> open, -1 -> close
			// 	checked: false,
			// 	parentChk: ''
			// }
			// this.dataTreeDonVi=res.data;			
			this.viewLoading = false;	
			let tree: any[] = [];
			if (res.data){
				res.data.forEach((element: any) => {
					let item = element;
					item.anCss= {
						collapse: true,
						lastChild: false,
						state: 0,//trạng thái luôn luôn mở node này, 0 -> open, -1 -> close
						checked: false,
						parentChk: ''
					}
					tree.push(item);
				});
			}
			this.dataTreeDonVi=tree;
		});
	}
	
	treeDonViChanged(item: any){
		if (item) {
			// this.donvi=item.data.IdGroup;
			this.dialogRef.close(item);
		}		
	}

	ngOnDestroy() {
		if (this.componentSubscriptions) {
			this.componentSubscriptions.unsubscribe();
		}
	}
	
	isControlInvalid(controlName: string): boolean {
		if (!this.DM_YKienForm) return false;
		const control = this.DM_YKienForm.controls[controlName];
		const result = control.invalid && control.touched;
		return result;
	}

	numberOnly(event: any): boolean {
		const charCode = (event.which) ? event.which : event.keyCode;
		if (charCode > 31 && (charCode < 48 || charCode > 57)) {
			return false;
		}
		return true;
	}

	closeDialog(){
		this.dialogRef.close(this.isChange);
	}
}