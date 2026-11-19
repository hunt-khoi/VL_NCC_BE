/*
 * Chep nguyen tu ng2-charts 2.4.3 (https://github.com/valor-software/ng2-charts/tree/v2.4.3),
 * giay phep ISC, xem LICENSE. Giu Chart.js 2.9 de bieu do khong doi giao dien;
 * ng2-charts 2.x chi co ban View Engine nen khong dung duoc tu Angular 16.
 */
/* eslint-disable */
// private helper functions
export interface Color {
  backgroundColor?: string | string[];
  borderWidth?: number | number[];
  borderColor?: string | string[];
  borderCapStyle?: string;
  borderDash?: number[];
  borderDashOffset?: number;
  borderJoinStyle?: string;

  pointBorderColor?: string | string[];
  pointBackgroundColor?: string | string[];
  pointBorderWidth?: number | number[];

  pointRadius?: number | number[];
  pointHoverRadius?: number | number[];
  pointHitRadius?: number | number[];

  pointHoverBackgroundColor?: string | string[];
  pointHoverBorderColor?: string | string[];
  pointHoverBorderWidth?: number | number[];
  pointStyle?: string | string[];

  hoverBackgroundColor?: string | string[];
  hoverBorderColor?: string | string[];
  hoverBorderWidth?: number;
}
