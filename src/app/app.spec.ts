import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { App } from './app';
import { User } from './Services/user';

describe('App', () => {
  let healthCheckResponse: boolean;

  beforeEach(async () => {
    healthCheckResponse = true;
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        { provide: User, useValue: { healthCheck: () => of(healthCheckResponse) } },
      ],
    }).compileComponents();
  });

  it('should show the app routes when the health check returns true', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('router-outlet')).not.toBeNull();
  });

  it('should show an unavailable message when the health check returns false', () => {
    healthCheckResponse = false;
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const rendered = fixture.nativeElement as HTMLElement;
    expect(rendered.querySelector('router-outlet')).toBeNull();
    expect(rendered.textContent).toContain('The server is unavailable');
  });
});
