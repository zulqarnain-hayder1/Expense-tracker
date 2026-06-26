import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Transaction {
  id?: number;
  title: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  date: string;
  description?: string;
  created_at?: string;
}

export interface SummaryResponse {
  total_income: number;
  total_expense: number;
  net_balance: number;
  category_breakdown: Array<{
    category: string;
    type: string;
    total: number;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private apiUrl = 'http://127.0.0.1:8000/api/expenses';

  constructor(private http: HttpClient) {}

  getTransactions(filters?: {
    search?: string;
    type?: string;
    category?: string;
    start_date?: string;
    end_date?: string;
    sort_by?: string;
  }): Observable<Transaction[]> {
    let params = new HttpParams();
    if (filters) {
      if (filters.search) params = params.set('search', filters.search);
      if (filters.type) params = params.set('type', filters.type);
      if (filters.category) params = params.set('category', filters.category);
      if (filters.start_date) params = params.set('start_date', filters.start_date);
      if (filters.end_date) params = params.set('end_date', filters.end_date);
      if (filters.sort_by) params = params.set('sort_by', filters.sort_by);
    }
    return this.http.get<Transaction[]>(`${this.apiUrl}/`, { params });
  }

  getTransaction(id: number): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.apiUrl}/${id}/`);
  }

  createTransaction(transaction: Transaction): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.apiUrl}/`, transaction);
  }

  updateTransaction(id: number, transaction: Transaction): Observable<Transaction> {
    return this.http.put<Transaction>(`${this.apiUrl}/${id}/`, transaction);
  }

  deleteTransaction(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}/`);
  }

  getSummary(): Observable<SummaryResponse> {
    return this.http.get<SummaryResponse>(`${this.apiUrl}/summary/`);
  }
}
