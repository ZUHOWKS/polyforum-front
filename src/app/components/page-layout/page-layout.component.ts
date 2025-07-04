import { Component, computed, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-page-layout',
  imports: [RouterOutlet, RouterLink, CommonModule],
  templateUrl: './page-layout.component.html',
  styleUrls: ['./page-layout.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageLayoutComponent {
  private authService = inject(AuthService);

  currentUser = signal<User | null>(null);

  userAvatarUrl = computed(() => {
    const user = this.currentUser();
    if (!user) return '';

    // Generate avatar URL based on user email using Gravatar or similar service
    const email = user.email.toLowerCase().trim();
    const hash = this.generateHash(email);
    return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=80`;
  });

  constructor() {
    // Initialize user state
    this.updateUserState();
  }

  private updateUserState(): void {
    const user = this.authService.getCurrentUser();
    this.currentUser.set(user);
  }

  private generateHash(email: string): string {
    // Simple hash function for demo purposes
    // In production, you might want to use a proper crypto library
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      const char = email.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  logout(): void {
    this.authService.logout();
    this.currentUser.set(null);
    // Optionally redirect to home page
    window.location.href = '/posts';
  }
}
