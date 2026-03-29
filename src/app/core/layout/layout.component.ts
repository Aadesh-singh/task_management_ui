import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {
  authService = inject(AuthService);
  router = inject(Router)
  isTeamUser = this.authService.isTeamUser;
  currentUser = this.authService.currentUser;

  logout() {
    console.log('click')
    this.authService.logout();
    this.router.navigate(['/auth']);
  }
}
