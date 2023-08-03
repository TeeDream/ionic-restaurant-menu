import { inject, Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
  BehaviorSubject,
  catchError,
  defer,
  from,
  Observable,
  retry,
  Subject,
  take,
  takeUntil,
  throwError,
} from 'rxjs';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
  user,
  UserCredential,
} from '@angular/fire/auth';
import { RegistrationInterface } from '@src/app/auth/types/auth.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService implements OnDestroy {
  private readonly ACCESS_TOKEN = 'accessToken';
  private readonly IS_ADMIN = 'isAdmin';
  private isLoggedIn$ = new BehaviorSubject<boolean>(false);
  public isLoggedIn = false;
  public isAdmin = false;
  public isAdmin$ = new BehaviorSubject<boolean>(false);
  private auth: Auth = inject(Auth);
  public user$: Observable<User | null> = user(this.auth);
  public userEmail$: BehaviorSubject<string | null> = new BehaviorSubject<
    string | null
  >(null);
  private destroy$: Subject<void> = new Subject<void>();

  constructor(private http: HttpClient) {
    // browserSessionPersistence
    // await this.auth.setPersistence()
    this.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe((aUser: User | null) => {
        this.isLoggedIn = aUser !== null;
        this.isLoggedIn$.next(this.isLoggedIn);
        this.isAdmin = aUser !== null;
        this.isAdmin$.next(this.isAdmin);

        this.userEmail$.next(aUser?.email ? aUser.email : null);

        console.log(aUser);
        // console.log(this.auth.currentUser);
        // console.log(this.auth.currentUser?.uid, 'uid');
        // getToken() //???
        // reauthenticateWithCredential
      });
  }

  public registerUser(user: RegistrationInterface): Observable<UserCredential> {
    return defer(() =>
      from(createUserWithEmailAndPassword(this.auth, user.email, user.password))
    ).pipe(retry(2), take(1), catchError(this.handleError));
  }

  public logIn(user: RegistrationInterface): Observable<UserCredential> {
    // onAuthStateChanged()
    return defer(() =>
      from(signInWithEmailAndPassword(this.auth, user.email, user.password))
    );
    // signInWithEmailAndPassword(this.auth, user.email, user.password)
    //   .then((userCredential) => {
    //     const user = userCredential.user;
    //     console.log(user);
    //   })
    //   .catch((error) => {
    //     const errorCode = error.code;
    //     const errorMessage = error.message;
    //     console.log(errorCode, errorMessage);
    //   });

    //       this.setAccessToken(response);
    //       this.setRole(response);
  }

  public logOut(): void {
    signOut(this.auth);
  }

  // private setAccessToken({ accessToken }: RegistrationLoginResponse): void {
  //   localStorage.setItem(this.ACCESS_TOKEN, accessToken);
  //   this.isLoggedIn = !!accessToken;
  //   this.isLoggedIn$.next(this.isLoggedIn);
  // }

  public getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN);
  }

  // private setRole({ user }: RegistrationLoginResponse): void {
  //   localStorage.setItem(
  //     this.IS_ADMIN,
  //     user.admin ? String(user.admin) : String(false)
  //   );
  //
  //   this.isAdmin = user.admin ? user.admin : false;
  //   this.isAdmin$.next(this.isAdmin);
  // }

  private getRole(): boolean {
    return true;
    // const role: string | null = localStorage.getItem(this.IS_ADMIN);
    //
    // return !!(role && role.includes('true'));
  }

  public checkIsLoggedIn(): void {
    // if (!this.getAccessToken()) return;

    this.isLoggedIn = true;
    this.isLoggedIn$.next(this.isLoggedIn);
    this.isAdmin = this.getRole();
    this.isAdmin$.next(this.isAdmin);
  }

  public getLogInStatus$(): Observable<boolean> {
    return this.isLoggedIn$.asObservable();
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    if (error.status === 0) {
      console.error('An error occurred:', error.error);
    } else {
      console.error(
        `Backend returned code ${error.status}, body was: `,
        error.error
      );
    }

    return throwError(
      () => new Error('Something bad happened; please try again later.')
    );
  }

  ngOnDestroy(): void {
    this.isLoggedIn$.complete();
    this.isAdmin$.complete();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
