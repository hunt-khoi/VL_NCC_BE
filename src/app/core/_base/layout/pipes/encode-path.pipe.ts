import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'encodePath'
})
export class EncodePathPipe implements PipeTransform {
	transform(value: string): string {
		if (!value) return '';
		return btoa(encodeURIComponent(value));
	}
}
