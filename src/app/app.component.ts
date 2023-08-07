import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '@src/app/auth/services/auth.service';
import { Observable, Subject, takeUntil } from 'rxjs';

type Toast = 'login' | 'logout';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  public appPages = [
    {title: 'Main', url: '/folder/main', icon: 'home'},
    {title: 'Menu', url: '/menu', icon: 'restaurant'},
    {title: 'Login', url: '/auth/log-in', icon: 'log-in'},
    {title: 'Register', url: '/auth/register', icon: 'person-add'},
  ];
  public labels = ['Family', 'Friends', 'Notes', 'Work', 'Travel', 'Reminders'];
  public loginStatus$: Observable<boolean> = this.auth.getLogInStatus$();
  public userEmail$: Observable<string | null> =
    this.auth.userEmail$.asObservable();
  private destroy$: Subject<void> = new Subject<void>();
  public isLoggedInToastOpen: boolean = false;
  public isLoggedOutToastOpen: boolean = false;
  private wasLoggedIn: boolean = false;
  public dismissToastButton = [
    {
      text: 'Dismiss',
      role: 'cancel',
    },
  ];

  constructor(private auth: AuthService) {
  }

  public logOut(): void {
    this.auth.logOut();
  }

  public setToastOpen(toast: Toast, state: boolean): void {
    if (toast === 'login') {
      this.isLoggedInToastOpen = state;
    }

    if (toast === 'logout') {
      this.isLoggedOutToastOpen = state;
    }
  }

  public ngOnInit(): void {
    this.auth.user$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      if (user) {
        this.isLoggedInToastOpen = true;
        this.wasLoggedIn = true;
      }

      if (!user && this.wasLoggedIn) {
        this.isLoggedOutToastOpen = true;
        this.wasLoggedIn = false;
      }
    });
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
