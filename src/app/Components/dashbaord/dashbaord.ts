
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';

@Component({
  selector: 'app-dashbaord',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './dashbaord.html',
  styleUrl: './dashbaord.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashbaord {
  private readonly router = inject(Router);

protected readonly menuItems = [
  { label: 'Overview', path: 'overview' },
  { label: 'Leads', path: 'leads' },
] as const;

  protected logout(): void {
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }
}
