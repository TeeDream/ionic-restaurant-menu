import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '@src/app/auth/services/auth.service';
import { Observable, Subject } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  public appPages = [
    { title: 'Inbox', url: '/folder/inbox', icon: 'mail' },
    { title: 'Outbox', url: '/folder/outbox', icon: 'paper-plane' },
    { title: 'Favorites', url: '/folder/favorites', icon: 'heart' },
    { title: 'Archived', url: '/folder/archived', icon: 'archive' },
    { title: 'Trash', url: '/folder/trash', icon: 'trash' },
    { title: 'Spam', url: '/folder/spam', icon: 'warning' },
    { title: 'Menu', url: '/menu', icon: 'warning' },
  ];
  public labels = ['Family', 'Friends', 'Notes', 'Work', 'Travel', 'Reminders'];
  public loginStatus$: Observable<boolean> = this.auth.getLogInStatus$();
  public userEmail$: Observable<string | null> =
    this.auth.userEmail$.asObservable();
  private destroy$ = new Subject<void>();

  constructor(private auth: AuthService) {}

  public ngOnInit(): void {
    // this.auth.user$
    //   .pipe(
    //     takeUntil(this.destroy$),
    //     tap((user) => {
    //       this.userEmail = user?.email ? user.email : null;
    //     })
    //   )
    //   .subscribe();
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
