import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { User } from './Services/user';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly userService = inject(User);
  protected readonly healthStatus = signal<'checking' | 'available' | 'unavailable'>('checking');

  constructor() {
    this.checkHealth();
  }

  protected retryHealthCheck(): void {
    this.checkHealth();
  }

  private checkHealth(): void {
    this.healthStatus.set('checking');

    this.userService.healthCheck().subscribe({
      next: (response) => {
        this.healthStatus.set(response === true ? 'available' : 'unavailable');
      },
      error: (error: unknown) => {
        console.error('Health check failed:', error);
        this.healthStatus.set('unavailable');
      }
    });
  }
}
