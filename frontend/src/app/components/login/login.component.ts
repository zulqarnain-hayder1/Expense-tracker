import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  isLoginMode = true;
  username = '';
  email = '';
  password = '';
  errorMessage = '';
  isLoading = false;

  constructor(private authService: AuthService, private router: Router) {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  toggleMode(): void {
    this.isLoginMode = !this.isLoginMode;
    this.errorMessage = '';
    this.username = '';
    this.email = '';
    this.password = '';
  }

  onSubmit(): void {
    if (!this.username || !this.password || (!this.isLoginMode && !this.email)) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    this.errorMessage = '';
    this.isLoading = true;

    if (this.isLoginMode) {
      this.authService.login({ username: this.username, password: this.password }).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error?.detail || 'Invalid username or password.';
        }
      });
    } else {
      this.authService.register({ username: this.username, email: this.email, password: this.password }).subscribe({
        next: () => {
          this.authService.login({ username: this.username, password: this.password }).subscribe({
            next: () => {
              this.isLoading = false;
              this.router.navigate(['/dashboard']);
            },
            error: () => {
              this.isLoading = false;
              this.isLoginMode = true;
            }
          });
        },
        error: (err) => {
          this.isLoading = false;
          const errors = err.error;
          if (errors && typeof errors === 'object') {
            this.errorMessage = Object.keys(errors)
              .map(key => `${key}: ${errors[key]}`)
              .join(' ');
          } else {
            this.errorMessage = 'Registration failed. Try again.';
          }
        }
      });
    }
  }
}
