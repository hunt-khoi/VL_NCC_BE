import { NestedTreeControl } from '@angular/cdk/tree';
import { Component, ChangeDetectionStrategy, OnInit, Inject, ChangeDetectorRef, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';
import { NhomNguoiDungDPSService } from '../Services/nhom-nguoi-dung-dps.service';
import { NhomNguoiDungDPSModel } from '../Model/nhom-nguoi-dung-dps.model';
import { ArrayDataSource, SelectionModel } from '@angular/cdk/collections';
import { CommonService } from '../../../services/common.service';

export class TodoItemNode {
	children?: TodoItemNode[];
	item: string = "";
	selected?: boolean;
	value?: any;
}

@Component({
	selector: 'kt-phan-quyen',
	templateUrl: './phan-quyen.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class PhanQuyenComponent implements OnInit {
	// Public properties
	hasFormErrors: boolean = false;
	loadingSubject = new BehaviorSubject<boolean>(true);
	loading$: Observable<boolean> | undefined;
	viewLoading: boolean = false;
	isZoomSize: boolean = false;
	NhomNguoiDungDPS: NhomNguoiDungDPSModel = new NhomNguoiDungDPSModel();
	treeControl: NestedTreeControl<TodoItemNode> | undefined;
	dataSource: ArrayDataSource<TodoItemNode> | undefined;

	hasChild = (_: number, node: TodoItemNode) => !!node.children && node.children.length > 0;
	TREE_DATA: TodoItemNode[] = [];
	/** The selection for checklist */
	checklistSelection = new SelectionModel<TodoItemNode>(true /* multiple */);
	selected: number[] = [];
	disabledBtn: boolean = false;

	constructor(
		public dialogRef: MatDialogRef<PhanQuyenComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private apiService: NhomNguoiDungDPSService,
		private commonService: CommonService) { }

	async ngOnInit() {
		this.viewLoading = true;
		this.treeControl = new NestedTreeControl<TodoItemNode>(node => node.children);
		this.dataSource = new ArrayDataSource(this.TREE_DATA);
		this.NhomNguoiDungDPS = this.data.NhomNguoiDungDPS;
		this.commonService.getTreeQuyen(this.NhomNguoiDungDPS.IdGroup).subscribe(res => {
			if (res && res.status == 1) {
				this.TREE_DATA = res.data;
				this.treeControl = new NestedTreeControl<TodoItemNode>(node => node.children);
				this.dataSource = new ArrayDataSource(this.TREE_DATA);
				this.bindSelection(null, this.TREE_DATA);
			} else {
				this.layoutUtilsService.showError(res.error.message);
			}
			this.viewLoading = false;
			this.changeDetectorRefs.detectChanges();
		});
	}

	bindSelection(parent: TodoItemNode | null, nodes: TodoItemNode[] = []) {
		if (!nodes || !this.treeControl) return;
		for (var i = 0; i < nodes.length; i++) {
			if (nodes[i].selected) {
				this.todoLeafItemSelectionToggle(nodes[i]);
				while (parent) {
					this.treeControl.expand(parent);
					parent = this.getParentNode(parent);
				}
			}
			if (nodes[i].children) {
				this.bindSelection(nodes[i], nodes[i].children);
			}
		}
	}

	getTitle(): string {
		return `Phân quyền`;
	}

	onAlertClose() {
		this.hasFormErrors = false;
	}

	onSubmit() {
		let data: any = {
			IdGroup: this.NhomNguoiDungDPS.IdGroup,
			Quyens: this.selected
		};
		this.disabledBtn = true;
		this.apiService.updateQuyen(data).subscribe(res => {
			this.disabledBtn = false;
			if (res && res.status == 1) {
				this.layoutUtilsService.showInfo("Cập nhật quyền cho vai trò thành công");
				this.closeDialog();
			} else {
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	closeDialog() {
		this.dialogRef.close();
	}

	/** Whether all the descendants of the node are selected. */
	descendantsAllSelected(node: TodoItemNode): boolean {
		if (!this.treeControl) return false;
		const descendants = this.treeControl.getDescendants(node);
		const descAllSelected = descendants.every(child =>
			this.checklistSelection.isSelected(child)
		);
		return descAllSelected;
	}

	/** Whether part of the descendants are selected */
	descendantsPartiallySelected(node: TodoItemNode): boolean {
		if (!this.treeControl) return false;
		const descendants = this.treeControl.getDescendants(node);
		const result = descendants.some(child => this.checklistSelection.isSelected(child));
		return result && !this.descendantsAllSelected(node);
	}

	/** Toggle the to-do item selection. Select/deselect all the descendants node */
	todoItemSelectionToggle(node: TodoItemNode): void {
		this.checklistSelection.toggle(node);
		if (!this.treeControl) return;
		const descendants = this.treeControl.getDescendants(node);
		this.checklistSelection.isSelected(node)
			? this.checklistSelection.select(...descendants)
			: this.checklistSelection.deselect(...descendants);
		// Force update for the parent
		descendants.every(child => this.checklistSelection.isSelected(child));
		this.checkAllParentsSelection(node);
		descendants.forEach(child => {
			this.selectedChange(child);
		});
	}

	/** Toggle a leaf to-do item selection. Check all the parents to see if they changed */
	todoLeafItemSelectionToggle(node: TodoItemNode): void {
		this.checklistSelection.toggle(node);
		this.checkAllParentsSelection(node);
		this.selectedChange(node);
	}

	/* Checks all the parents when a leaf node is selected/unselected */
	checkAllParentsSelection(node: TodoItemNode): void {
		let parent: TodoItemNode | null = this.getParentNode(node);
		while (parent) {
			this.checkRootNodeSelection(parent);
			parent = this.getParentNode(parent);
		}
	}

	/** Check root node checked state and change it accordingly */
	checkRootNodeSelection(node: TodoItemNode): void {
		if (!this.treeControl) return;
		const nodeSelected = this.checklistSelection.isSelected(node);
		const descendants = this.treeControl.getDescendants(node);
		const descAllSelected = descendants.every(child =>
			this.checklistSelection.isSelected(child)
		);
		if (nodeSelected && !descAllSelected) {
			this.checklistSelection.deselect(node);
		} else if (!nodeSelected && descAllSelected) {
			this.checklistSelection.select(node);
		}
	}
	/* Get the parent node of a node */
	getParentNode(node: TodoItemNode): TodoItemNode | null {
		let arr = this.TREE_DATA;
		return this.getParent(node, arr);
	}

	getParent(node: TodoItemNode, nodes: TodoItemNode[] = []): any {
		if (!nodes) return null;
		for (var i = 0; i < nodes.length; i++) {
			var currentData = nodes[i].children;
			if (currentData) {
				var index = currentData.indexOf(node);
				if (index >= 0) {
					return nodes[i];
				}
				var result = this.getParent(node, currentData);
				if (result)
					return result;
			}
		}
	}

	selectedChange(node: TodoItemNode) {
		if (node.value) {
			var i = this.selected.indexOf(node.value);
			if (this.checklistSelection.isSelected(node)) {
				if (i < 0)
					this.selected.push(node.value);
			}
			else {
				if (i >= 0)
					this.selected.splice(i, 1);
			}
		}
	}
}