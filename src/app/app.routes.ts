import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadComponent: () => import('./features/auth/auth.component').then(m => m.AuthComponent),
    title: 'TaskFlow | Authentication'
  },
  {
    path: '',
    loadComponent: () => import('./core/layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
        title: 'TaskFlow | Dashboard'
      },
      {
        path: 'teams',
        loadComponent: () => import('./features/teams/teams.component').then(m => m.TeamsComponent),
        title: 'TaskFlow | My Team'
      },
      {
        path: 'projects',
        loadComponent: () => import('./shared/components/coming-soon/coming-soon.component').then(m => m.ComingSoonComponent),
        title: 'TaskFlow | Projects (Coming Soon)'
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
