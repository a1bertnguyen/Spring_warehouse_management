import { Component } from '@angular/core';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { ChartOptions, ChartType } from 'chart.js';
import { CommonModule } from '@angular/common';
import { transactionService } from '../service/transactionService';

@Component({
  selector: 'app-stat-chart',
  standalone: true,
  imports: [BaseChartDirective, CommonModule],
  providers: [provideCharts(withDefaultRegisterables())],
  template: `
    <div class="err" *ngIf="error">{{ error }}</div>

    <canvas baseChart
        [data]="barChartData"
        [options]="barChartOptions"
        [type]="barChartType">
    </canvas>
  `
})
export class StatChartComponent {

  transactions: any[] = [];
  error = "";
  barChartType: ChartType = 'bar';

  barChartOptions: ChartOptions = {
    responsive: true,
    scales: {
      y: { beginAtZero: true }
    }
  };

  barChartData = {
    labels: [] as string[],
    datasets: [
      { label: 'Selling orders', data: [] as any[], backgroundColor: 'green' },
      { label: 'Purchasing orders', data: [] as any[], backgroundColor: 'gold' }
    ]
  };

  constructor(private transactionService: transactionService) {}

  ngOnInit() {
    this.loadTransactions();
  }

  loadTransactions() {
    this.transactionService.getAllTran().subscribe({
      next: (model) => {
        this.transactions = model;
        console.log(this.transactions)
        this.buildChart();
      },
      error: () => this.error = "Failed to load transaction"
    });
  }

  buildChart() {
    const last30Days = this.transactions
      .filter(t => {
        const date = new Date(t.createdAt);
        const diff = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
        return diff <= 30;
      })
      .reduce((acc: any, t: any) => {
        const key = new Date(t.createdAt).toISOString().split('T')[0];
        if (!acc[key]) acc[key] = { sell: 0, purchase: 0 };

        if (t.transactionType === 'SALE') acc[key].sell++;
        if (t.transactionType === 'PURCHASE') acc[key].purchase++;

        return acc;
      }, {});

    const labels = Object.keys(last30Days).sort();
    const sellData = labels.map(d => last30Days[d].sell);
    const purchaseData = labels.map(d => last30Days[d].purchase);

    // Update chart
    this.barChartData = {
      labels,
      datasets: [
        { label: 'Selling orders', data: sellData, backgroundColor: 'green' },
        { label: 'Purchasing orders', data: purchaseData, backgroundColor: 'gold' }
      ]
    };
  }
}
