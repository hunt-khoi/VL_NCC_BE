export class QueryResultsModel {
	status: number = 0;
	data: any[];
	dataExtra: any[] = [];
	items: any[];
	page: any;
	totalCount: number;
	errorMessage: string = '';
	error: any;
	Visible: boolean=true;

	constructor(items: any[] = [], totalCount: number = 0, errorMessage: string = '') {
		this.items = this.data = items;
		this.totalCount = totalCount;
		this.errorMessage = errorMessage;
	}
}