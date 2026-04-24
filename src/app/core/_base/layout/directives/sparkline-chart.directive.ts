import { AfterViewInit, Directive, ElementRef, Input } from '@angular/core';
import { LayoutConfigService } from '../../layout/services/layout-config.service';
import { Chart } from 'chart.js/dist/Chart.min.js';

export interface SparklineChartOptions {
	// array of numbers
	data: number[];
	// chart line color
	color: string;
	// chart line size
	border: number;
	fill?: boolean;
	tooltip?: boolean;
}

@Directive({
	selector: '[ktSparklineChart]',
	exportAs: 'ktSparklineChart'
})
export class SparklineChartDirective implements AfterViewInit {
	@Input() options: SparklineChartOptions | undefined;
	private chart: Chart;

	constructor(private el: ElementRef, private layoutConfigService: LayoutConfigService) { }

	ngAfterViewInit(): void {
		if (this.options)
			this.initChart(this.el.nativeElement, this.options.data, this.options.color, this.options.border, this.options.fill, this.options.tooltip);
	}

	initChart(src: any, data: any, color: any, border: any, fill: any, tooltip: any) {
		if (src.length === 0) return;
		// set default values
		fill = (typeof fill !== 'undefined') ? fill : false;
		tooltip = (typeof tooltip !== 'undefined') ? tooltip : false;

		const config = {
			type: 'line',
			data: {
				labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October'],
				datasets: [{
					label: '',
					borderColor: color,
					borderWidth: border,
					pointHoverRadius: 4,
					pointHoverBorderWidth: 12,
					pointBackgroundColor: Chart.helpers.color('#000000').alpha(0).rgbString(),
					pointBorderColor: Chart.helpers.color('#000000').alpha(0).rgbString(),
					pointHoverBackgroundColor: this.layoutConfigService.getConfig('colors.state.danger'),
					pointHoverBorderColor: Chart.helpers.color('#000000').alpha(0.1).rgbString(),
					fill: false,
					data,
				}]
			},
			options: {
				title: {
					display: false,
				},
				tooltips: {
					enabled: false,
					intersect: false,
					mode: 'nearest',
					xPadding: 10,
					yPadding: 10,
					caretPadding: 10
				},
				legend: {
					display: false,
					labels: {
						usePointStyle: false
					}
				},
				responsive: true,
				maintainAspectRatio: true,
				hover: {
					mode: 'index'
				},
				scales: {
					xAxes: [{
						display: false,
						gridLines: false,
						scaleLabel: {
							display: true,
							labelString: 'Month'
						}
					}],
					yAxes: [{
						display: false,
						gridLines: false,
						scaleLabel: {
							display: true,
							labelString: 'Value'
						},
						ticks: {
							beginAtZero: true
						}
					}]
				},
				elements: {
					point: {
						radius: 4,
						borderWidth: 12
					},
				},
				layout: {
					padding: {
						left: 0,
						right: 10,
						top: 5,
						bottom: 0
					}
				}
			}
		};
		this.chart = new Chart(src, config);
	}

	getChart() {
		return this.chart;
	}
}