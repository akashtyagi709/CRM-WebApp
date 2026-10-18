
import { Component, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AnyCatcher } from 'rxjs/internal/AnyCatcher';
import { User } from '../../Services/user';
import { environment } from '../../../environments/environment';

interface ApiResponse<T> {
  msg: string;
  success: boolean;
  data: T | null;
}

type ToastType = 'success' | 'error' | 'loading' | 'info';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './homepage.html',
  styleUrl: './homepage.css',
})
export class Homepage implements OnDestroy {
  private toastTimer: ReturnType<typeof setTimeout> | undefined;

  readonly currentYear = new Date().getFullYear();

  isSubmitting = false;

  toastVisible = false;
  toastMessage = '';
  toastType: ToastType = 'success';

  contact = {
    name: '',
    email: '',
    phone: '',
    message: '',
  };

  constructor(private userService: User) {}


submitContact(): void {
  if (this.isSubmitting) {
    return;
  }

  this.isSubmitting = true;

  // Remove any previous toast while the request is processing.
  this.clearToastTimer();
  this.toastVisible = false;

  const submittedContact = { ...this.contact };

  this.userService
    .apiCall<ApiResponse<string>>(
      environment.contact,
      submittedContact
    )
    .subscribe({
      next: (response) => {
        console.log('Contact API response:', response);
                  this.resetForm();

        if (response.success) {
          this.showToast(
            response.data || response.msg,
            'success'
          );

          this.resetForm();
        } else if (
          response.msg?.toLowerCase().includes('already saved')
        ) {
          this.showToast(response.msg, 'info');
        } else {
          this.showToast(
            response.msg || 'Unable to submit your request.',
            'error'
          );
        }

        this.isSubmitting = false;
      },

      error: (error) => {
        this.showToast(
          error.error?.msg ||
            'We could not submit your request. Please try again.',
          'error'
        );

        this.contact = submittedContact;
        this.isSubmitting = false;

        console.error('Contact API request failed:', error);
      },
    });
}

  private resetForm(): void {
    this.contact = {
      name: '',
      email: '',
      phone: '',
      message: '',
    };
  }

  private showToast(
    message: string,
    type: ToastType,
    duration = 4000
  ): void {
    this.clearToastTimer();

    this.toastMessage = message;
    this.toastType = type;
    this.toastVisible = true;

    // Keep the loading toast visible until the API responds.
    if (duration > 0) {
      this.toastTimer = setTimeout(() => {
        this.toastVisible = false;
        this.toastTimer = undefined;
      }, duration);
    }
  }

  private clearToastTimer(): void {
    if (this.toastTimer !== undefined) {
      clearTimeout(this.toastTimer);
      this.toastTimer = undefined;
    }
  }

  closeToast(): void {
    this.clearToastTimer();
    this.toastVisible = false;
  }

  ngOnDestroy(): void {
    this.clearToastTimer();
  }
}
