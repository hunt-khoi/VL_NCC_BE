import { NestedTreeControl } from '@angular/cdk/tree';
import { Component, ChangeDetectionStrategy, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { LayoutUtilsService } from '../../../../../core/_base/crud';
import { ArrayDataSource, SelectionModel } from '@angular/cdk/collections';
import { CommonService } from '../../services/common.service';

export class TodoItemNode {
	children?: TodoItemNode[];
	item: string = "";
	selected?: boolean;
	value?: any;
	data?: any;
}
@Component({
	selector: 'kt-nguoi-dung-don-vi',
	templateUrl: './nguoi-dung-don-vi.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NguoiDungDonViComponent implements OnInit {
	hasFormErrors: boolean = false;
	loadingSubject = new BehaviorSubject<boolean>(true);
	loading$: Observable<boolean> = this.loadingSubject.asObservable();
	viewLoading: boolean = false;
	isZoomSize: boolean = false;
	treeControl: NestedTreeControl<TodoItemNode> | undefined;
	dataSource: ArrayDataSource<TodoItemNode> | undefined;

	hasChild = (_: number, node: TodoItemNode) => !!node.children && node.children.length > 0;

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
	/** The selection for checklist */
	checklistSelection = new SelectionModel<TodoItemNode>(true /* multiple */);
	selected: any[] = [];
	disabledBtn: boolean = false;
	useVaiTro: boolean = true;
	chonDV: boolean = false;

	constructor(
		public dialogRef: MatDialogRef<NguoiDungDonViComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		public commonService: CommonService) { }

	async ngOnInit() {
		if (this.data.chonDV != undefined)
			this.chonDV = this.data.chonDV;
		if (this.data.useVaiTro != undefined)
			this.useVaiTro = this.data.useVaiTro;
		if (this.data.selected)
			this.selected = this.data.selected;

		this.viewLoading = true;
		this.treeControl = new NestedTreeControl<TodoItemNode>(node => node.children);
		this.dataSource = new ArrayDataSource(this.TREE_DATA);
		this.commonService.getTreeNguoiDungDonVi(0, this.useVaiTro).subscribe(res => {
			if (res && res.status == 1) {
				this.TREE_DATA = res.data;
				if (this.data.addNode) { //node custom thêm vào cây
					let mapNode = this.data.addNode.map((x: { id: any; title: any; }) => {
						return {
							data: {
								Id: x.id,
								Name: x.title,
								Type: 2
							}, item: x.title
						};
					});
					this.TREE_DATA = mapNode.concat(this.TREE_DATA);
				}
				this.treeControl = new NestedTreeControl<TodoItemNode>(node => node.children);
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
		if (!parent || !this.treeControl) return;
		for (var i = 0; i < nodes.length; i++) {
			if (nodes[i].data && this.exist(nodes[i].data) >= 0)
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
			if (nodes[i].children) {
				this.bindSelection(nodes[i], nodes[i].children);
			}
		}
	}

	exist(data: any) {
		let index = -1;
		if (this.selected) {
			for (var i = 0; i < this.selected.length; i++) {
				let item = this.selected[i];
				if (item.Id == data.Id && item.Type == data.Type && (!this.useVaiTro || (this.useVaiTro && item.IdGroup == data.IdGroup))) {
					index = i;
					break;
				}
			}
		}
		return index;
	}

	getTitle(): string {
		return "Người dùng đơn vị";
	}

	onSubmit() {
		var item = this.selected;
		this.disabledBtn = true;
		this.dialogRef.close(item);
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
		if (!result) return false;
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
				if (index >= 0) 
					return nodes[i];
				var result = this.getParent(node, currentData);
				if (result)
					return result;
			}
		}
	}

	selectedChange(node: TodoItemNode) {
		if (node.value) {
			var i = this.exist(node.data);
			if (this.checklistSelection.isSelected(node)) {
				if (i < 0) {
					let item = node.data;
					if (this.data._data)
						item.IdNhom = this.data._data.Id;
					this.selected.push(item);
				}
			}
			else {
				if (i >= 0)
					this.selected.splice(i, 1);
			}
		}
	}

	checkedChange($event: any, node: TodoItemNode) {
		//let ids: number[] = this.selected.map(x => x.Id);
		node.selected = $event.checked;
		let item = node.data;
		if (this.data._data)
			item.IdNhom = this.data._data.Id;

		//let i = ids.indexOf(item.Id);
		var i = this.exist(node.data);
		if (node.selected && i < 0)
			this.selected.push(item);
		if (!node.selected && i >= 0)
			this.selected.splice(i, 1);
	}
}