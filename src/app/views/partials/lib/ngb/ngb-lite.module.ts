/*
 * Gom cac thanh phan ng-bootstrap 5.3.1 ma du an dang dung (xem README.md trong thu muc nay).
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbDropdown, NgbDropdownAnchor, NgbDropdownItem, NgbDropdownMenu, NgbDropdownToggle, NgbNavbar } from './dropdown/dropdown';
import { NgbTooltip, NgbTooltipWindow } from './tooltip/tooltip';
import { NgbProgressbar } from './progressbar/progressbar';
import { NgbTab, NgbTabContent, NgbTabset, NgbTabTitle } from './tabset/tabset';
import { NGB_CAROUSEL_DIRECTIVES } from './carousel/carousel';
import { NgbTimepicker } from './timepicker/timepicker';

const DIRECTIVES = [
	NgbDropdown, NgbDropdownAnchor, NgbDropdownToggle, NgbDropdownMenu, NgbDropdownItem, NgbNavbar,
	NgbTooltip, NgbTooltipWindow,
	NgbProgressbar,
	NgbTabset, NgbTab, NgbTabContent, NgbTabTitle,
	...NGB_CAROUSEL_DIRECTIVES,
	NgbTimepicker,
];

@NgModule({
	declarations: DIRECTIVES,
	imports: [CommonModule, FormsModule],
	exports: DIRECTIVES,
})
export class NgbLiteModule { }

export { NgbDropdown } from './dropdown/dropdown';
export { NgbTimeAdapter } from './timepicker/ngb-time-adapter';
export { NgbTimeStruct } from './timepicker/ngb-time-struct';
