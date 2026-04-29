import { Component, OnInit, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { NestedTreeControl } from '@angular/cdk/tree';
import { ArrayDataSource } from '@angular/cdk/collections';
import { BehaviorSubject } from 'rxjs';
import { MatDialog} from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { OrgChartModel } from '../Model/so-do-to-chuc.model';
import { OrgChartService } from '../Services/so-do-to-chuc.service';
import { sodotochuceditComponent } from '../so-do-to-chuc-edit/so-do-to-chuc-edit.component';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';

interface TreeNode {
	Name: string;
	children?: TreeNode[];
	ID: string;
	Position: string;
	Select: boolean
}
export class TodoItemNode {
  	children: TodoItemNode[] = [];
	item: string = "";
}
export class TodoItemFlatNode {
	ID: any;
	item: any;
	level: number = 0;
	chucdanhParent: any;
	expandable: boolean = false;
	children: any;
}

export class ChecklistDatabase {
	dataChange = new BehaviorSubject<TodoItemNode[]>([]);

	get data(): TodoItemNode[] { return this.dataChange.value; }

	constructor() {
		this.initialize();
	}

	initialize() {
		// Build the tree nodes from Json object. The result is a list of `TodoItemNode` with nested
		//     file node as children.
		// const data = this.buildFileTree(TREE_DATA, 0);

		// Notify the change.
		// this.dataChange.next(data);
	}

	/**
	 * Build the file structure tree. The `value` is the Json object, or a sub-tree of a Json object.
	 * The return value is the list of `TodoItemNode`.
	 */
	buildFileTree(obj: { [key: string]: any }, level: number): TodoItemNode[] {
		return Object.keys(obj).reduce<TodoItemNode[]>((accumulator, key) => {
			const value = obj[key];
			const node = new TodoItemNode();
			node.item = key;
			if (value) {
				if (typeof value === 'object') {
					node.children = this.buildFileTree(value, level + 1);
				} else {
					node.item = value;
				}
			}
			return accumulator.concat(node);
		}, []);
	}

	/** Add an item to to-do list */
	insertItem(parent: TodoItemNode, name: string): TodoItemNode {
		if (!parent.children) {
			parent.children = [];
		}
		const newItem = { item: name } as TodoItemNode;
		parent.children.push(newItem);
		this.dataChange.next(this.data);
		return newItem;
	}

	insertItemAbove(node: TodoItemNode, name: string): TodoItemNode {
		const parentNode = this.getParentFromNodes(node);
		const newItem = { item: name } as TodoItemNode;
		if (parentNode != null) {
			parentNode.children.splice(parentNode.children.indexOf(node), 0, newItem);
		} else {
			this.data.splice(this.data.indexOf(node), 0, newItem);
		}
		this.dataChange.next(this.data);
		return newItem;
	}

	insertItemBelow(node: TodoItemNode, name: string): TodoItemNode {
		const parentNode = this.getParentFromNodes(node);
		const newItem = { item: name } as TodoItemNode;
		if (parentNode != null) {
			parentNode.children.splice(parentNode.children.indexOf(node) + 1, 0, newItem);
		} else {
			this.data.splice(this.data.indexOf(node) + 1, 0, newItem);
		}
		this.dataChange.next(this.data);
		return newItem;
	}

	getParentFromNodes(node: TodoItemNode): TodoItemNode | null {
		for (let i = 0; i < this.data.length; ++i) {
			const currentRoot = this.data[i];
			const parent = this.getParent(currentRoot, node);
			if (parent) 
				return parent;
		}
		return null;
	}

	getParent(currentRoot: TodoItemNode, node: TodoItemNode): TodoItemNode | null {
		if (currentRoot.children && currentRoot.children.length > 0) {
			for (let i = 0; i < currentRoot.children.length; ++i) {
				const child = currentRoot.children[i];
				if (child === node) {
					return currentRoot;
				} else if (child.children && child.children.length > 0) {
					const parent = this.getParent(child, node);
					if (parent) 
						return parent;
				}
			}
		}
		return null;
	}

	updateItem(node: TodoItemNode, name: string) {
		node.item = name;
		this.dataChange.next(this.data);
	}

	deleteItem(node: TodoItemNode) {
		this.deleteNode(this.data, node);
		this.dataChange.next(this.data);
	}

	copyPasteItem(from: TodoItemNode, to: TodoItemNode): TodoItemNode {
		const newItem = this.insertItem(to, from.item);
		if (from.children) {
			from.children.forEach(child => {
				this.copyPasteItem(child, newItem);
			});
		}
		return newItem;
	}

	copyPasteItemAbove(from: TodoItemNode, to: TodoItemNode): TodoItemNode {
		const newItem = this.insertItemAbove(to, from.item);
		if (from.children) {
			from.children.forEach(child => {
				this.copyPasteItem(child, newItem);
			});
		}
		return newItem;
	}

	copyPasteItemBelow(from: TodoItemNode, to: TodoItemNode): TodoItemNode {
		const newItem = this.insertItemBelow(to, from.item);
		if (from.children) {
			from.children.forEach(child => {
				this.copyPasteItem(child, newItem);
			});
		}
		return newItem;
	}

	deleteNode(nodes: TodoItemNode[], nodeToDelete: TodoItemNode) {
		const index = nodes.indexOf(nodeToDelete, 0);
		if (index > -1) {
			nodes.splice(index, 1);
		} else {
			nodes.forEach(node => {
				if (node.children && node.children.length > 0) {
					this.deleteNode(node.children, nodeToDelete);
				}
			});
		}
	}
}

@Component({
	selector: 'm-so-do-to-chuc-new-list',
	templateUrl: './so-do-to-chuc-new-list.component.html',
	styleUrls: ['./so-do-to-chuc-new-list.component.scss'],
	providers: [ChecklistDatabase],
	encapsulation: ViewEncapsulation.None
})
export class SodotochucListComponent implements OnInit {
	// displayedColumns = ['STT', 'ChucVu', 'NgayCap', 'actions'];
	treeControl = new NestedTreeControl<TreeNode>(node => node.children);
	dataSource: any;
	selectedNode: any;
	positionFrom: string = '';
	parentFrom: string = '';
	idFrom: string = '';
	idTo: string = '';
	nameTo: string = '';
	namefrom: string = '';
	viewLoading: boolean = false;
	loadingAfterSubmit: boolean = false;
	listDonVi: any[] = [];
	listCheDoLamViec: any[] = [];
	productsResult: OrgChartModel[] = [];
	jobtitleid: string = "";
	id_menu: number = 8;
	Visible: boolean = false;
	public datatree: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
	disabledBtn: boolean = false;
	flatNodeMap = new Map<TodoItemFlatNode, TodoItemNode>();
	dragNode: any;
	/** Map from nested node to flattened node. This helps us to keep the same object for selection */
	nestedNodeMap = new Map<TodoItemNode, TodoItemFlatNode>();
	dragNodeExpandOverWaitTimeMs = 300;
	dragNodeExpandOverNode: any;
	dragNodeExpandOverTime: number = 0;
	dragNodeExpandOverArea: string = "";
	/** A selected parent node to be inserted */
	selectedParent: TodoItemFlatNode | null = null;
	/** The new item's name */
	newItemName = '';
	_itemchart: OrgChartModel = new OrgChartModel();
	__selectedNode: TodoItemFlatNode | null = null;
	showTruyCapNhanh: boolean = true;

	getLevel = (node: TodoItemFlatNode) => node.level;
	isExpandable = (node: TodoItemFlatNode) => node.expandable;
	getChildren = (node: TodoItemNode): TodoItemNode[] => node.children;
	hasNoContent = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.item === '';
	hasChild = (_: number, node: TreeNode) => !!node.children && node.children.length > 0;

	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	_name = "";

	constructor(
		private apiService: OrgChartService,
		private changeDetectorRefs: ChangeDetectorRef,
		public dialog: MatDialog,
		private translate: TranslateService,
		private layoutUtilsService: LayoutUtilsService) {
		this._name = this.translate.instant("SO_DO_TO_CHUC.NAME");
	}

	async ngOnInit() {
		await this.getTreeValue();
		this.changeDetectorRefs.detectChanges();
	};


	//DEMO Treeview
	async getTreeValue() {
		this.loadingSubject.next(true);
		this.viewLoading = true;
		this.changeDetectorRefs.detectChanges();
		this.apiService.GetOrganizationalChart(this.jobtitleid).subscribe(res => {
			this.loadingSubject.next(false);
			this.viewLoading = false;
			this.changeDetectorRefs.detectChanges();
			if (res.data && res.data.length > 0) {
				if (res.Visible)
					this.Visible = true;
				this.dataSource = new ArrayDataSource(res.data);
				this.treeControl.dataNodes = res.data;
				this.treeControl.expandAll();
				this.changeDetectorRefs.detectChanges();
			}
		});
	}


	addNewItem(node: TodoItemFlatNode) {
		// const itemNode = this.flatNodeMap.get(node);
		this._itemchart = new OrgChartModel();
		this._itemchart.ID = node.ID;
		let saveMessageTranslateParam = '';
		saveMessageTranslateParam += this.translate.instant('OBJECT.EDIT.UPDATE_MESSAGE', { name: this._name });
		const _saveMessage = this.translate.instant(saveMessageTranslateParam, { name: this._name });
		let Id_parent = node.ID;
		let id_cd = 0;
		let chucdanhParent = node.chucdanhParent;
		let vitriMax = 0;

		if (node.children.length > 0) 
			vitriMax = parseInt(node.children[node.children.length - 1].level) + 1;
		else
			vitriMax = 1;
		
		const dialogRef = this.dialog.open(sodotochuceditComponent, { data: { Id_parent, id_cd, chucdanhParent, vitriMax }, width: '65%', });
		dialogRef.afterClosed().subscribe(res => {
			this.getTreeValue();
			if (res) {
				this.layoutUtilsService.showInfo(_saveMessage);
			}
		});
	}

	//#region =================== Delete node
	removeItem(node: TodoItemFlatNode) {
		// const itemNode = this.flatNodeMap.get(node);
		// this.database.deleteItem(itemNode);
		//Gọi api delete node
		const _title = this.translate.instant('OBJECT.DELETE.TITLE', { name: this._name.toLowerCase() });
		const _description = this.translate.instant('OBJECT.DELETE.DESCRIPTION', { name: this._name.toLowerCase() });
		const _waitDesciption = this.translate.instant('OBJECT.DELETE.WAIT_DESCRIPTION', { name: this._name.toLowerCase() });
		const _deleteMessage = this.translate.instant('OBJECT.DELETE.MESSAGE', { name: this._name });
		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) return;

			this.apiService.DeleteOrgChart(node.ID).subscribe(res => {
				if (res && res.status === 1) {
					this.layoutUtilsService.showInfo(_deleteMessage)
				}
				else {
					this.layoutUtilsService.showError(res.error.message);
				}
				this.getTreeValue();
			});
		});
	}

	handleDragStart(event: any, node: any) {
		// this.idFrom = node.ID;
		// this.namefrom = node.Name;
		this.removeClass("dl-drag");
		let el = document.getElementById(node.ID);
		if (el)
			el.classList.add("dl-drag");
		event.dataTransfer.setData('foo', 'bar');
		// event.dataTransfer.setDragImage(this.emptyItem.nativeElement, 0, 0);
		this.dragNode = node;
		this.treeControl.collapse(node);
	}

	removeClass(className: any) {
		let c = document.getElementsByClassName(className);
		for (let i = 0; i < c.length; i++) {
			c[i].classList.remove(className);
		}
	}

	selectedItem(node: TodoItemFlatNode) {
		this.__selectedNode = node;
		//Gọi j thi gọi làm j làm
	}

	handleDragOver(event: any, node: any) {
		event.preventDefault();
		this.removeClass("dl-drag-over");
		let el = document.getElementById(node.ID);
		if (el)
			el.classList.add("dl-drag-over");
		if (node === this.dragNodeExpandOverNode) {
			if (this.dragNode !== node && !this.treeControl.isExpanded(node)) {
				if ((new Date().getTime() - this.dragNodeExpandOverTime) > this.dragNodeExpandOverWaitTimeMs) {
					this.treeControl.expand(node);
				}
			}
		} else {
			this.dragNodeExpandOverNode = node;
			this.dragNodeExpandOverTime = new Date().getTime();
		}

		// Handle drag area
		// const percentageX = event.offsetX / event.target.offsetWidth;
		// const percentageY = event.offsetY / event.target.offsetHeight;

		const percentageY = event.offsetY / event.target.offsetParent.clientHeight;
		if (percentageY < 0.25) {
			this.dragNodeExpandOverArea = 'above';
		} else
			if (percentageY > 0.75) {
				this.dragNodeExpandOverArea = 'below';
			}
			else {
				this.dragNodeExpandOverArea = 'center';
			}
	}

	handleDragEnd(event: any) {
		this.dragNode = null;
		this.dragNodeExpandOverNode = null;
		this.dragNodeExpandOverTime = 0;
		this.removeClass("dl-drag");
		this.removeClass("dl-drag-over");
	}

	handleDrop(event: any, node: any) {
		event.preventDefault();
		this.apiService.GetOrganizationalChart(this.jobtitleid).subscribe(res => {
			this.dataSource.data = res.data;
			if (!res.Visible) {
				this.layoutUtilsService.showError('Bạn không có quyền thao tác');
				this.getTreeValue();
				return null;
			}
		});
		if (node !== this.dragNode) {
			// let newItem: TodoItemNode;
			// let fromNode = this.flatNodeMap.get(this.dragNode);
			// let toNode = this.flatNodeMap.get(node);

			this._itemchart = new OrgChartModel();
			this._itemchart.drop_nameto = node.chucdanhParent;
			this._itemchart.drop_namefrom = this.dragNode.chucdanhParent;
			this._itemchart.drop_idfrom = this.dragNode.ID;
			this._itemchart.drop_idto = node.ID;

			if (this.dragNodeExpandOverArea === 'above') {
				this._itemchart.IsAbove = true;
				this.apiService.handleDropLevel(this._itemchart).subscribe(res => {
					this.treeControl.expandAll();
				});
				// newItem = this.database.copyPasteItemAbove(this.flatNodeMap.get(this.dragNode), this.flatNodeMap.get(node));
			} 
			else
				if (this.dragNodeExpandOverArea === 'below') {// Update vị trí 
					this._itemchart.IsAbove = false;
					this.apiService.handleDropLevel(this._itemchart).subscribe(res => {
						this.treeControl.expandAll();
					});
					// newItem = this.database.copyPasteItemBelow(this.flatNodeMap.get(this.dragNode), this.flatNodeMap.get(node));
				}
				else {// update cha con
					let vitritieptheo = 0;
					if (node.children.length > 0) 
						vitritieptheo = parseInt(node.children[node.children.length - 1].level) + 1;
					else
						vitritieptheo = 1;

					this._itemchart.drop_levelto = '' + vitritieptheo;
					this.apiService.handleDropParent(this._itemchart).subscribe(res => {
						this.treeControl.expandAll();
					});
					// newItem = this.database.copyPasteItem(this.flatNodeMap.get(this.dragNode), this.flatNodeMap.get(node));
				}

			this.getTreeValue();
			// this.database.deleteItem(this.flatNodeMap.get(this.dragNode));
			// this.treeControl.expandDescendants(this.nestedNodeMap.get(newItem));
		}
		this.dragNode = null;
		this.dragNodeExpandOverNode = null;
		this.dragNodeExpandOverTime = 0;
	}

	CapNhatThongTinChucVu(id_cd: string) {
		let saveMessageTranslateParam = '';
		saveMessageTranslateParam += this.translate.instant('OBJECT.EDIT.UPDATE_MESSAGE', { name: this._name });
		const _saveMessage = this.translate.instant(saveMessageTranslateParam, { name: this._name });
		let Id_parent = 0;
		let chucdanhParent = '';
		const dialogRef = this.dialog.open(sodotochuceditComponent, { data: { Id_parent, id_cd, chucdanhParent }, width: '65%', });
		dialogRef.afterClosed().subscribe(res => {
			this.getTreeValue();
			if (res) {
				this.layoutUtilsService.showInfo(_saveMessage);
			}
		});
	}
}