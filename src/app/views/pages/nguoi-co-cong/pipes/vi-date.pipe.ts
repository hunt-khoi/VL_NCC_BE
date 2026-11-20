import { DatePipe } from '@angular/common';
import { Inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';

// "dd/MM/yyyy", "dd/MM/yyyy HH:mm", "dd/MM/yyyy H:mm:ss SA/CH" (SA = sáng, CH = chiều).
const VI_DATE = /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[ T]+(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\s*(SA|CH|AM|PM))?)?$/i;

/** Đọc ngày dạng Việt Nam (dd/MM/yyyy...); không khớp thì trả lại nguyên giá trị. */
export function parseViDate(value: unknown): unknown {
	if (typeof value !== 'string') return value;
	const m = value.trim().match(VI_DATE);
	if (!m) return value;
	const [, d, mo, y, h = '0', mi = '0', s = '0', ampm] = m;
	let hours = +h;
	const suffix = ampm?.toUpperCase();
	if ((suffix === 'CH' || suffix === 'PM') && hours < 12) hours += 12;
	if ((suffix === 'SA' || suffix === 'AM') && hours === 12) hours = 0;
	return new Date(+y, +mo - 1, +d, hours, +mi, +s);
}

/**
 * Như pipe `date`, nhưng nhận thêm chuỗi ngày dạng Việt Nam.
 * Backend .NET 10 trả ngày đã định dạng sẵn ("14/12/2017 11:56") thay cho DateTime (ISO) của bản cũ;
 * pipe `date` gốc báo lỗi NG02100 với chuỗi đó, hoặc đảo ngày/tháng khi ngày <= 12.
 */
@Pipe({ name: 'viDate', standalone: true })
export class ViDatePipe implements PipeTransform {
	private readonly datePipe: DatePipe;

	constructor(@Inject(LOCALE_ID) locale: string) {
		this.datePipe = new DatePipe(locale);
	}

	transform(value: unknown, format = 'dd/MM/yyyy', timezone?: string, locale?: string): string | null {
		if (value === null || value === undefined || value === '') return null;
		return this.datePipe.transform(parseViDate(value) as any, format, timezone, locale);
	}
}
