import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TransactionService, SummaryResponse, Transaction } from '../../services/transaction.service';
import { TransactionFormComponent } from '../transaction-form/transaction-form.component';
import { TransactionListComponent } from '../transaction-list/transaction-list.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, TransactionFormComponent, TransactionListComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  username = '';
  summary: SummaryResponse = {
    total_income: 0,
    total_expense: 0,
    net_balance: 0,
    category_breakdown: []
  };
  recentTransactions: Transaction[] = [];
  isFormOpen = false;
  selectedTransaction: Transaction | null = null;
  isLoading = true;
  isSeeding = false;

  // Chart references
  trendChart: any = null;
  categoryChart: any = null;

  categoryColors: Record<string, string> = {
    Food: '#ff6b6b',
    Rent: '#4dadf7',
    'Hostel Rent': '#3b82f6',
    'Mess Fee': '#f97316',
    'Travel Expenses': '#06b6d4',
    'Tuition Fee': '#a855f7',
    'Stationery & Books': '#eab308',
    'Pocket Money': '#d946ef',
    Utilities: '#ffd43b',
    Entertainment: '#b197fc',
    Salary: '#37b24d',
    Freelance: '#2b8a3e',
    Others: '#adb5bd'
  };

  constructor(
    private authService: AuthService,
    private transactionService: TransactionService,
    private router: Router
  ) {
    this.username = this.authService.currentUserSignal() || 'User';
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroyCharts();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.transactionService.getSummary().subscribe({
      next: (data) => {
        this.summary = data;
        this.transactionService.getTransactions({ sort_by: 'date_desc' }).subscribe({
          next: (list) => {
            this.recentTransactions = list.slice(0, 5);
            this.isLoading = false;
            
            // Give templates a tiny digest cycle to render canvases, then draw charts
            setTimeout(() => this.renderCharts(), 100);
          },
          error: () => {
            this.isLoading = false;
          }
        });
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  openAddModal(): void {
    this.selectedTransaction = null;
    this.isFormOpen = true;
  }

  openEditModal(transaction: Transaction): void {
    this.selectedTransaction = transaction;
    this.isFormOpen = true;
  }

  closeFormModal(): void {
    this.isFormOpen = false;
    this.selectedTransaction = null;
  }

  onTransactionSaved(): void {
    this.closeFormModal();
    this.loadDashboardData();
  }

  onDeleteTransaction(id: number): void {
    if (confirm('Are you sure you want to delete this transaction?')) {
      this.transactionService.deleteTransaction(id).subscribe({
        next: () => {
          this.loadDashboardData();
        }
      });
    }
  }

  getCategoryPercentage(total: number, type: string): number {
    const base = type === 'income' ? this.summary.total_income : this.summary.total_expense;
    return base > 0 ? Math.round((total / base) * 100) : 0;
  }

  // Seed Mock Data
  seedMockData(): void {
    if (this.isSeeding) return;
    this.isSeeding = true;
    this.isLoading = true;

    const mockList: Omit<Transaction, 'id' | 'created_at'>[] = [
      { title: 'Monthly Pocket Money Allowance', amount: 450, category: 'Pocket Money', type: 'income', date: this.getRelativeDate(0) },
      { title: 'Part-time Library Job Salary', amount: 650, category: 'Salary', type: 'income', date: this.getRelativeDate(-2) },
      { title: 'Freelance Coding Assignment', amount: 200, category: 'Freelance', type: 'income', date: this.getRelativeDate(-10) },
      { title: 'Semester Tuition Fee Payment', amount: 1200, category: 'Tuition Fee', type: 'expense', date: this.getRelativeDate(-25) },
      { title: 'Hostel Monthly Rent', amount: 450, category: 'Hostel Rent', type: 'expense', date: this.getRelativeDate(-28) },
      { title: 'Mess Monthly Food Fee', amount: 180, category: 'Mess Fee', type: 'expense', date: this.getRelativeDate(-27) },
      { title: 'Weekly Bus Ticket Home', amount: 25, category: 'Travel Expenses', type: 'expense', date: this.getRelativeDate(-4) },
      { title: 'Reference Textbooks & Notebooks', amount: 65.40, category: 'Stationery & Books', type: 'expense', date: this.getRelativeDate(-15) },
      { title: 'Supermarket Groceries & Snacks', amount: 55.20, category: 'Food', type: 'expense', date: this.getRelativeDate(-3) },
      { title: 'Netflix Sharing Plan', amount: 8.99, category: 'Entertainment', type: 'expense', date: this.getRelativeDate(-20) },
      { title: 'Mobile Data Recharge', amount: 25.00, category: 'Utilities', type: 'expense', date: this.getRelativeDate(-12) },
      { title: 'Coffee & Donuts during Exam Prep', amount: 12.50, category: 'Food', type: 'expense', date: this.getRelativeDate(-1) }
    ];

    let completed = 0;
    mockList.forEach(tx => {
      this.transactionService.createTransaction(tx as Transaction).subscribe({
        next: () => {
          completed++;
          if (completed === mockList.length) {
            this.isSeeding = false;
            this.loadDashboardData();
            alert('Mock data successfully loaded into PostgreSQL database! Student charts have updated.');
          }
        },
        error: () => {
          completed++;
          if (completed === mockList.length) {
            this.isSeeding = false;
            this.loadDashboardData();
          }
        }
      });
    });
  }

  private getRelativeDate(daysOffset: number): string {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    return d.toISOString().substring(0, 10);
  }

  // Chart Rendering Logic using global Chart.js
  private renderCharts(): void {
    const ChartClass = (window as any).Chart;
    if (!ChartClass) return;

    this.destroyCharts();

    // 1. Bar Chart: Income vs Expense Trend
    const trendCanvas = document.getElementById('trendChart') as HTMLCanvasElement;
    if (trendCanvas) {
      this.trendChart = new ChartClass(trendCanvas, {
        type: 'bar',
        data: {
          labels: ['Total Income', 'Total Expenses'],
          datasets: [{
            data: [this.summary.total_income, this.summary.total_expense],
            backgroundColor: ['#10b981', '#f43f5e'],
            borderRadius: 8,
            borderWidth: 0,
            barThickness: 35
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              titleFont: { family: 'Plus Jakarta Sans', weight: 'bold' },
              bodyFont: { family: 'Plus Jakarta Sans' },
              padding: 12,
              cornerRadius: 8
            }
          },
          scales: {
            y: {
              grid: { color: 'rgba(255, 255, 255, 0.05)' },
              ticks: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans' } }
            },
            x: {
              grid: { display: false },
              ticks: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', weight: '600' } }
            }
          }
        }
      });
    }

    // 2. Doughnut Chart: Expenses Category distribution
    const catCanvas = document.getElementById('categoryChart') as HTMLCanvasElement;
    if (catCanvas) {
      const expenseBreakdown = this.summary.category_breakdown.filter(c => c.type === 'expense');
      const labels = expenseBreakdown.map(c => c.category);
      const data = expenseBreakdown.map(c => c.total);
      const colors = labels.map(label => this.categoryColors[label] || '#adb5bd');

      if (data.length > 0) {
        this.categoryChart = new ChartClass(catCanvas, {
          type: 'doughnut',
          data: {
            labels: labels,
            datasets: [{
              data: data,
              backgroundColor: colors,
              borderWidth: 2,
              borderColor: '#0f172a',
              hoverOffset: 12
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'right',
                labels: {
                  color: '#e2e8f0',
                  font: { family: 'Plus Jakarta Sans', size: 12, weight: '500' },
                  padding: 15
                }
              },
              tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                titleFont: { family: 'Plus Jakarta Sans', weight: 'bold' },
                bodyFont: { family: 'Plus Jakarta Sans' },
                padding: 12,
                cornerRadius: 8
              }
            },
            cutout: '75%'
          }
        });
      }
    }
  }

  private destroyCharts(): void {
    if (this.trendChart) {
      this.trendChart.destroy();
      this.trendChart = null;
    }
    if (this.categoryChart) {
      this.categoryChart.destroy();
      this.categoryChart = null;
    }
  }
}
