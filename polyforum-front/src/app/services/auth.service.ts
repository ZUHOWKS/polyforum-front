import { Injectable, signal, computed } from '@angular/core';

export interface User {
  id: string;
  email: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://127.0.0.1:8090/api/collections/users';

  // Signal for current user state
  private currentUserSignal = signal<User | null>(null);

  // Public computed for read-only access
  currentUser = computed(() => this.currentUserSignal());
  isAuthenticated = computed(() => !!this.currentUserSignal());

  constructor() {
    // Initialize user state from localStorage
    this.initializeUserState();
  }

  private initializeUserState(): void {
    const user = this.getCurrentUser();
    this.currentUserSignal.set(user);
  }

  private async makeRequest(url: string, options: RequestInit = {}): Promise<any> {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async login(email: string, password: string): Promise<void> {
    try {
      const url = `${this.apiUrl}/auth-with-password`;
      const data = await this.makeRequest(url, {
        method: 'POST',
        body: JSON.stringify({ identity: email, password })
      });

      // Store authentication data
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userId', data.record.id);
      localStorage.setItem('userEmail', data.record.email);
      localStorage.setItem('userName', data.record.name);

      // Update signal
      const user: User = {
        id: data.record.id,
        email: data.record.email,
        name: data.record.name
      };
      this.currentUserSignal.set(user);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(email: string, password: string, name: string): Promise<void> {
    try {
      const userData = {
        email,
        password,
        passwordConfirm: password,
        name
      };

      const url = `${this.apiUrl}/records`;
      await this.makeRequest(url, {
        method: 'POST',
        body: JSON.stringify(userData)
      });

      // Auto-login after registration
      await this.login(email, password);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');

    // Update signal
    this.currentUserSignal.set(null);
  }

  getCurrentUser(): User | null {
    const userId = localStorage.getItem('userId');
    const userEmail = localStorage.getItem('userEmail');
    const userName = localStorage.getItem('userName');

    if (userId && userEmail && userName) {
      return {
        id: userId,
        email: userEmail,
        name: userName
      };
    }
    return null;
  }
}
