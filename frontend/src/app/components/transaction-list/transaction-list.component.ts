import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService, Transaction } from '../../services/transaction.service';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transaction-list.component.html',
  styleUrls: ['./transaction-list.component.css']
})
export class TransactionListComponent implements OnInit {
  @Output() editRequested = new EventEmitter<Transaction>();
  @Output() deleteRequested = new EventEmitter<number>();
  @Output() filterChanged = new EventEmitter<void>();

  transactions: Transaction[] = [];
  isLoading = false;

  search = '';
  type = '';
  category = '';
  startDate = '';
  endDate = '';
  sortBy = 'date_desc';

  categories = ['Food', 'Rent', 'Hostel Rent', 'Mess Fee', 'Travel Expenses', 'Tuition Fee', 'Stationery & Books', 'Pocket Money', 'Utilities', 'Entertainment', 'Salary', 'Freelance', 'Others'];

  constructor(private transactionService: TransactionService) {}

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.isLoading = true;
    this.transactionService.getTransactions({
      search: this.search,
      type: this.type,
      category: this.category,
      start_date: this.startDate,
      end_date: this.endDate,
      sort_by: this.sortBy
    }).subscribe({
      next: (list) => {
        this.transactions = list;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  onFilterChange(): void {
    this.loadTransactions();
    this.filterChanged.emit();
  }

  resetFilters(): void {
    this.search = '';
    this.type = '';
    this.category = '';
    this.startDate = '';
    this.endDate = '';
    this.sortBy = 'date_desc';
    this.onFilterChange();
  }

  editItem(item: Transaction): void {
    this.editRequested.emit(item);
  }

  deleteItem(id: number): void {
    this.deleteRequested.emit(id);
  }

  exportData(): void {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.transactions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `expenses_export_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        try {
          const importedList: Transaction[] = JSON.parse(e.target.result);
          if (Array.isArray(importedList)) {
            let processed = 0;
            const toImport = importedList.filter(item => item.title && item.amount && item.date);
            if (toImport.length === 0) {
              alert('No valid transactions found in file.');
              return;
            }
            if (confirm(`Import ${toImport.length} transactions?`)) {
              this.isLoading = true;
              toImport.forEach((item) => {
                const payload: Transaction = {
                  title: item.title,
                  amount: Number(item.amount),
                  category: item.category || 'Others',
                  type: item.type === 'income' ? 'income' : 'expense',
                  date: item.date,
                  description: item.description || ''
                };
                this.transactionService.createTransaction(payload).subscribe({
                  next: () => {
                    processed++;
                    if (processed === toImport.length) {
                      this.isLoading = false;
                      this.onFilterChange();
                      alert('Data imported successfully!');
                    }
                  },
                  error: () => {
                    processed++;
                    if (processed === toImport.length) {
                      this.isLoading = false;
                      this.onFilterChange();
                    }
                  }
                });
              });
            }
          } else {
            alert('Invalid file format. Must be a JSON array.');
          }
        } catch (err) {
          alert('Error reading JSON file.');
        }
      };
      reader.readAsText(file);
    }
  }
}
