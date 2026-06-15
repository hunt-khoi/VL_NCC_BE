import { BaseModel } from 'app/core/_base/crud';

export class SysConfigModel extends BaseModel {
	IdRow: number = 0;
	Code: string = '';
	Value: string = '';
	IdGroup: number = 0;
	Priority: number = 1;
	Type: string = '';
	Description: string = '';
	Pattern: string = '';

	clear() {
		this.IdRow = 0;
		this.Code = '';
		this.Value = '';
		this.IdGroup = 0;
		this.Priority = 1;
		this.Type = "";
		this.Description = "";
		this.Pattern = "";
	}
	
	copy(item: SysConfigModel) {
		this.IdRow = item.IdRow;
		this.Code = item.Code;
		this.Value = item.Value;
		this.IdGroup = item.IdGroup;
		this.Priority = item.Priority;
		this.Type = item.Type;
		this.Description = item.Description;
		this.Pattern = item.Pattern;
	}
}