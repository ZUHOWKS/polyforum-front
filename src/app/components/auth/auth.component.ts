import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent {
  isLoginMode = true;
  isLoading = false;
  errorMessage = '';

  // Form fields
  email = '';
  password = '';
  passwordConfirm = '';
  name = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  switchMode() {
    this.isLoginMode = !this.isLoginMode;
    this.errorMessage = '';
    this.clearForm();
  }

  clearForm() {
    this.email = '';
    this.password = '';
    this.passwordConfirm = '';
    this.name = '';
  }

  async onSubmit() {
    if (this.isLoading) return;

    this.isLoading = true;
    this.errorMessage = '';

    try {
      if (this.isLoginMode) {
        await this.authService.login(this.email, this.password);
      } else {
        if (this.password !== this.passwordConfirm) {
          this.errorMessage = 'Les mots de passe ne correspondent pas';
          this.isLoading = false;
          return;
        }
        await this.authService.register(this.email, this.password, this.name);
      }

      // Redirect to posts page after successful auth
      this.router.navigate(['/posts']);
    } catch (error: any) {
      this.errorMessage = error.message || 'Une erreur est survenue';
    } finally {
      this.isLoading = false;
    }
  }
}
