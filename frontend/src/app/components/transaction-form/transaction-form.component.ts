import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService, Transaction } from '../../services/transaction.service';

@Component({
  selector: 'app-transaction-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transaction-form.component.html',
  styleUrls: ['./transaction-form.component.css']
})
export class TransactionFormComponent implements OnInit, OnChanges {
  @Input() transaction: Transaction | null = null;
  @Output() saved = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  title = '';
  amount: number | null = null;
  category = 'Food';
  type: 'income' | 'expense' = 'expense';
  date = '';
  description = '';

  errorMessage = '';
  isLoading = false;
  categories = ['Food', 'Rent', 'Hostel Rent', 'Mess Fee', 'Travel Expenses', 'Tuition Fee', 'Stationery & Books', 'Pocket Money', 'Utilities', 'Entertainment', 'Salary', 'Freelance', 'Others'];
  constructor(private transactionService: TransactionService) {}

  ngOnInit(): void {
    this.resetForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['transaction']) {
      this.resetForm();
    }
  }

  resetForm(): void {
    if (this.transaction) {
      this.title = this.transaction.title;
      this.amount = this.transaction.amount;
      this.category = this.transaction.category;
      this.type = this.transaction.type;
      this.date = this.transaction.date;
      this.description = this.transaction.description || '';
    } else {
      this.title = '';
      this.amount = null;
      this.category = 'Food';
      this.type = 'expense';
      this.date = new Date().toISOString().substring(0, 10);
      this.description = '';
    }
    this.errorMessage = '';
  }

  onSubmit(): void {
    if (!this.title || !this.amount || !this.date) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    if (this.amount <= 0) {
      this.errorMessage = 'Amount must be greater than zero.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const payload: Transaction = {
      title: this.title,
      amount: this.amount,
      category: this.category,
      type: this.type,
      date: this.date,
      description: this.description
    };

    const request$ = this.transaction && this.transaction.id
      ? this.transactionService.updateTransaction(this.transaction.id, payload)
      : this.transactionService.createTransaction(payload);

    request$.subscribe({
      next: () => {
        this.isLoading = false;
        this.saved.emit();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.detail || 'An error occurred while saving the transaction.';
      }
    });
  }

  close(): void {
    this.closed.emit();
  }
}
