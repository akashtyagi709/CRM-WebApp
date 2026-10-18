import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, Subject } from 'rxjs';

import { Login } from './login';
import { User } from '../../Services/user';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let apiResponse: Subject<unknown>;
  let userService: { apiCall: () => Observable<unknown> };

  beforeEach(async () => {
    apiResponse = new Subject<unknown>();
    userService = { apiCall: () => apiResponse.asObservable() };

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [{ provide: User, useValue: userService }],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show validation errors when the form is submitted empty', () => {
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;

    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('#email-error')?.textContent).toContain(
      'Enter your email address.',
    );
    expect(fixture.nativeElement.querySelector('#password-error')?.textContent).toContain(
      'Enter your password.',
    );
  });

  it('should switch the submit button to a compact loading state while waiting for the API', () => {
    const email = fixture.nativeElement.querySelector('#email') as HTMLInputElement;
    const password = fixture.nativeElement.querySelector('#password') as HTMLInputElement;
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    const button = fixture.nativeElement.querySelector('.submit-button') as HTMLButtonElement;

    email.value = 'person@example.com';
    email.dispatchEvent(new Event('input', { bubbles: true }));
    password.value = 'correct-horse-battery';
    password.dispatchEvent(new Event('input', { bubbles: true }));
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(button.classList.contains('is-loading')).toBe(true);
    expect(button.disabled).toBe(true);
    expect(button.querySelector('.loading-spinner')).not.toBeNull();

    apiResponse.next({ status: true });
    fixture.detectChanges();

    expect(button.classList.contains('is-loading')).toBe(false);
    expect(button.textContent).toContain('Signed in');
  });

  it('should restore the submit button and show an error when sign-in is rejected', () => {
    const email = fixture.nativeElement.querySelector('#email') as HTMLInputElement;
    const password = fixture.nativeElement.querySelector('#password') as HTMLInputElement;
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;

    email.value = 'person@example.com';
    email.dispatchEvent(new Event('input', { bubbles: true }));
    password.value = 'correct-horse-battery';
    password.dispatchEvent(new Event('input', { bubbles: true }));
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    apiResponse.next({ status: false });
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('.submit-button') as HTMLButtonElement;
    expect(button.classList.contains('is-loading')).toBe(false);
    expect(button.disabled).toBe(false);
    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain(
      'We couldn’t sign you in',
    );
  });
});
