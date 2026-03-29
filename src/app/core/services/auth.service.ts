import { Injectable, inject, signal, computed } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, tap } from 'rxjs';

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  registrationType: 'individual' | 'team';
  role?: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiService = inject(ApiService);

  currentUser = signal<User | null>(this.getUserDetails());

  isTeamUser = computed(() => {
    const user = this.currentUser();
    return user?.registrationType === 'team';
  });

  login(credentials: any): Observable<any> {
    return this.apiService.post<any>('users/login', credentials).pipe(
      tap(res => {
        if (res.user) {
          this.setUserDetail(res.user);
        }
        const token = res.data?.accessToken || res.accessToken;
        if (token) {
          localStorage.setItem('accessToken', token);
        }
      })
    );
  }

  register(userData: any): Observable<any> {
    return this.apiService.post<any>('users/register', userData);
  }

  checkUsername(username: string): Observable<any> {
    return this.apiService.post<any>('users/checkUsername', { username });
  }

  getTeams(): Observable<any> {
    return this.apiService.get<any>('teams/list-all-teams');
  }

  getUserTeam(): Observable<any> {
    return this.apiService.get<any>('teams/get-user-team');
  }

  getTeamMembers(teamId: string): Observable<any> {
    return this.apiService.get<any>(`teams/list-user-of-team?teamId=${teamId}`);
  }

  refreshToken(): Observable<any> {
    return this.apiService.post<any>('users/refresh', {}).pipe(
      tap(res => {
        const token = res.data?.accessToken || res.accessToken;
        if (token) {
          localStorage.setItem('accessToken', token);
        }
      })
    );
  }

  setUserDetail(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUser.set(user);
  }

  getUserDetails(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  logout(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    this.currentUser.set(null);
  }
}
