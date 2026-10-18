import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from '../../Services/user';
import { environment } from '../../../environments/environment';
import { finalize } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private readonly formBuilder = inject(FormBuilder);

  protected readonly loginForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });
  protected readonly submitted = signal(false);
  protected readonly isLoading = signal(false);
  protected readonly loginError = signal('');
  private readonly userService = inject(User);
  showPassword = false;
  constructor(protected router:Router){}

  protected onSubmit(): void {
    if (this.loginForm.invalid || this.isLoading()) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loginError.set('');
    this.submitted.set(false);
    this.isLoading.set(true);

    this.userService
      .apiCall<unknown>(environment.login, this.loginForm.getRawValue())
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response:any) => {
          if (
            response.success === true
          ) {
            this.submitted.set(true);
            sessionStorage.setItem('token', (response?.data?.Bearer));
            this.router.navigate(["/dashboard"]);
            return;
          }

          this.loginError.set('We couldn’t sign you in. Check your details and try again.');
        },
        error: (error: unknown) => {
          console.error('Sign-in request failed:', error);
          this.loginError.set('We couldn’t reach the sign-in service. Please try again.');
        },
      });
  }
}
