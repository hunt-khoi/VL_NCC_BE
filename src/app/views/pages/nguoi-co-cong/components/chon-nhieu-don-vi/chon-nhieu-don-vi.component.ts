import { Component, ChangeDetectionStrategy, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { LayoutUtilsService } from '../../../../../core/_base/crud';
import { ArrayDataSource, SelectionModel } from '@angular/cdk/collections';
import { CommonService } from '../../services/common.service';

export class TodoItemNode {
	data?: TodoItemNode[];
	title: string = "";
	selected?: boolean;
	disabled?: boolean;
	id?: any;
}
@Component({
	selector: 'kt-chon-nhieu-don-vi',
	templateUrl: './chon-nhieu-don-vi.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChonNhieuDonViComponent implements OnInit {
	hasFormErrors: boolean = false;
	loadingSubject = new BehaviorSubject<boolean>(true);
	loading$: Observable<boolean> = this.loadingSubject.asObservable();
	viewLoading: boolean = false;
	isZoomSize: boolean = false;
	treeControl: NestedTreeControl<TodoItemNode> | undefined;
	dataSource: ArrayDataSource<TodoItemNode> | undefined;

	hasChild = (_: number, node: TodoItemNode) => !!node.data && node.data.length > 0;

	TREE_DATA: TodoItemNode[] = [
		//{
		//	item: 'Fruit',
		//	children: [
		//		{ item: 'Apple', selected: true },
		//		{ item: 'Banana' },
		//		{ item: 'Fruit loops' },
		//	]
		//}, {
		//	item: 'Vegetables',
		//	children: [
		//		{
		//			item: 'Green',
		//			children: [
		//				{ item: 'Broccoli', selected: true },
		//				{ item: 'Brussels sprouts' },
		//			]
		//		}, {
		//			item: 'Orange',
		//			children: [
		//				{ item: 'Pumpkins', selected: true },
		//				{ item: 'Carrots', selected: true },
		//			]
		//		},
		//	]
		//},
	];
	selected: any[] = [];
	disabled_ids: number[] = [];
	disabledBtn: boolean = false;
	type: number = 0;
	id_parent: number = 0;
	/** The selection for checklist */
	checklistSelection = new SelectionModel<TodoItemNode>(true /* multiple */);
	isMulti: boolean = false;

	constructor(
		public dialogRef: MatDialogRef<ChonNhieuDonViComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private commonService: CommonService) { }

	/**
	 * On init
	 */
	async ngOnInit() {
		if (this.data.id_parent) {
			this.id_parent = this.data.id_parent;
		}
		if (this.data.selected) {
			this.selected = this.data.selected;
		}
		if (this.data.disabled_ids) {
			this.disabled_ids = this.data.disabled_ids;
		}
		if (this.data.type) {//0: đơn vị(mặc định), 1: đơn vị theo cc
			this.type = this.data.type;
		}
		if (this.isMulti != undefined)
			this.isMulti = this.data.isMulti;

		this.viewLoading = true;
		this.treeControl = new NestedTreeControl<TodoItemNode>(node => node.data);
		this.dataSource = new ArrayDataSource(this.TREE_DATA);
		this.commonService.TreeDonVi(this.type, this.id_parent).subscribe(res => {
			if (res && res.status == 1) {
				this.TREE_DATA = res.data;
				this.treeControl = new NestedTreeControl<TodoItemNode>(node => node.data);
				this.dataSource = new ArrayDataSource(this.TREE_DATA);
				if (this.data && this.data.IsExpand) {//expand node
					this.treeControl.dataNodes = res.data;
					this.treeControl.expandAll();
				}
				this.bindSelection(null, this.TREE_DATA);
			} else {
				this.layoutUtilsService.showError(res.error.message);
			}
			this.viewLoading = false;
			this.changeDetectorRefs.detectChanges();
		});
	}

	bindSelection(parent: TodoItemNode | null, nodes: TodoItemNode[] = []) {
		let ids: number[] = this.selected.map(x => x.id);
		if (!this.treeControl) return;
		for (var i = 0; i < nodes.length; i++) {
			if (this.disabled_ids.includes(nodes[i].id)) {
				nodes[i].disabled = true;
			}	
			if (ids.includes(nodes[i].id)) 
				nodes[i].selected = true;
			else
				nodes[i].selected = false;

			if (nodes[i].selected) {
				this.todoLeafItemSelectionToggle(nodes[i]);
				while (parent) {
					this.treeControl.expand(parent);
					parent = this.getParentNode(parent);
				}
			}
			if (nodes[i].data) {
				this.bindSelection(nodes[i], nodes[i].data);
			}
		}
	}
	/* Get the parent node of a node */
	getParentNode(node: TodoItemNode): TodoItemNode | null {
		let arr = this.TREE_DATA;
		return this.getParent(node, arr);
	}

	getParent(node: TodoItemNode, nodes: TodoItemNode[]): any {
		if (nodes) {
			for (var i = 0; i < nodes.length; i++) {
				var currentData = nodes[i].data;
				if (currentData) {
					var index = currentData.indexOf(node);
					if (index >= 0) 
						return nodes[i];
					var result = this.getParent(node, currentData);
					if (result)
						return result;
				}
			}
		}
		return null;
	}

	checkedChange($event: any, node: TodoItemNode) {
		let ids: number[] = this.selected.map(x => x.id);
		node.selected = $event.checked;
		let temp = {
			id: node.id,
			title: node.title
		};
		let i = ids.indexOf(temp.id);
		if (node.selected && i < 0)
			this.selected.push(temp);
		if (!node.selected && i >= 0)
			this.selected.splice(i, 1);
	}

	onSubmit() {
		if (this.isMulti)
			this.dialogRef.close(this.checklistSelection.selected);
		else
			this.dialogRef.close(this.selected);
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

	//#region multi
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
		if (!this.treeControl) return;
		this.checklistSelection.toggle(node);
		const descendants = this.treeControl.getDescendants(node)
			.filter(x => !x.disabled); //ko check hay bỏ check các node con bị disabled;
		this.checklistSelection.isSelected(node)
			? this.checklistSelection.select(...descendants)
			: this.checklistSelection.deselect(...descendants);
		// Force update for the parent
		descendants.every(child => this.checklistSelection.isSelected(child));
		this.checkAllParentsSelection(node);
	}

	/** Toggle a leaf to-do item selection. Check all the parents to see if they changed */
	todoLeafItemSelectionToggle(node: TodoItemNode): void {
		this.checklistSelection.toggle(node);
		this.checkAllParentsSelection(node);
		//this.selectedChange(node);
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
	//#endregion
}