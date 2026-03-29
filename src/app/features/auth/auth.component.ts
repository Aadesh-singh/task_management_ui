import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { debounceTime, distinctUntilChanged, switchMap, map, of, catchError } from 'rxjs';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent implements OnInit {
  activeTab = signal<'login' | 'register'>('login');
  usernameStatus = signal<'idle' | 'loading' | 'available' | 'taken'>('idle');
  isSubmitting = signal(false);

  private router = inject(Router);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  teams: { _id: String, name: String }[] = [];

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  registerForm: FormGroup = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    registrationType: ['individual', Validators.required],
    team: ['']
  });

  ngOnInit(): void {
    this.authService.logout();
    this.fetchTeams();
    this.setupUsernameCheck();
    this.setupConditionalValidation();
  }

  private setupConditionalValidation(): void {
    const registrationTypeControl = this.registerForm.get('registrationType');
    const teamControl = this.registerForm.get('team');

    if (registrationTypeControl && teamControl) {
      registrationTypeControl.valueChanges.subscribe(type => {
        if (type === 'team') {
          teamControl.setValidators([Validators.required]);
        } else {
          teamControl.clearValidators();
          teamControl.setValue('');
        }
        teamControl.updateValueAndValidity();
      });
    }
  }

  private setupUsernameCheck(): void {
    const usernameControl = this.registerForm.get('username');
    if (usernameControl) {
      usernameControl.valueChanges.pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap(val => {
          if (!val || val.length < 3) {
            this.usernameStatus.set('idle');
            return of(null);
          }
          this.usernameStatus.set('loading');
          return this.authService.checkUsername(val).pipe(
            catchError(err => of({ success: false }))
          );
        })
      ).subscribe(res => {
        if (!res) return;
        if (res.status == 'success') {
          this.usernameStatus.set('available');
        } else {
          this.usernameStatus.set('taken');
        }
      });
    }
  }

  fetchTeams(): void {
    this.authService.getTeams().subscribe({
      next: (data: any) => {
        this.teams = data.teams || [];
      },
      error: (err) => {
        console.error('Failed to fetch teams:', err);
        this.teams = [];
      }
    });
  }

  onLoginSubmit() {
    if (this.loginForm.valid) {
      this.isSubmitting.set(true);
      this.authService.login(this.loginForm.value).subscribe({
        next: (res) => {
          this.toastService.success('Logged in successfully!');
          this.router.navigate(['/']);
          this.isSubmitting.set(false);
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Login failed. Please try again.');
          console.error('Login failed:', err);
          this.isSubmitting.set(false);
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  onRegisterSubmit() {
    if (this.registerForm.valid) {
      this.isSubmitting.set(true);
      console.log('Registration attempt with:', this.registerForm.value);
      this.authService.register(this.registerForm.value).subscribe({
        next: (res) => {
          this.toastService.success('Registration successful! Please sign in.');
          this.isSubmitting.set(false);
          this.activeTab.set('login');
          this.registerForm.reset({ registrationType: 'individual' });
          this.registerForm.markAsUntouched();
          this.registerForm.markAsPristine();
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Registration failed.');
          this.isSubmitting.set(false);
        }
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}
