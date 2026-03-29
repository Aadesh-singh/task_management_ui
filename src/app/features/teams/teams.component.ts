import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

interface Team {
  _id: string;
  name: string;
  description?: string;
  createdAt?: string;
}

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './teams.component.html',
  styleUrl: './teams.component.css'
})
export class TeamsComponent implements OnInit {
  private authService = inject(AuthService);

  team = signal<Team | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadUserTeam();
  }

  loadUserTeam() {
    this.isLoading.set(true);
    this.authService.getUserTeam().subscribe({
      next: (res) => {
        // Assuming response structure has the team object
        this.team.set(res.team || res.data?.team || res);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load team information.');
        this.isLoading.set(false);
      }
    });
  }
}
