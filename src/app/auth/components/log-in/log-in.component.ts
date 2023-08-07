import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '@src/app/auth/services/auth.service';
import { Router } from '@angular/router';
import { take } from 'rxjs';

@Component({
  selector: 'app-log-in',
  templateUrl: './log-in.component.html',
  styleUrls: ['./log-in.component.scss'],
})
export class LogInComponent {
  public hidePassword = true;
  public loginGroup = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(5),
      Validators.maxLength(9),
      Validators.pattern(/^[a-zA-Z0-9]+$/),
    ]),
  });

  constructor(private auth: AuthService, private router: Router) {}

  getErrorMessage(field: 'email' | 'password'): string {
    switch (field) {
      case 'email':
        return this.loginGroup.controls.email.hasError('required')
          ? 'Email is required'
          : this.loginGroup.controls.email.hasError('email')
          ? 'Please enter a valid email address'
          : '';

      case 'password':
        return this.loginGroup.controls.password.hasError('required')
          ? 'Password is required'
          : this.loginGroup.controls.password.hasError('pattern')
          ? 'Please use only a-z in any case and numbers.'
          : this.loginGroup.controls.password.hasError('minlength')
          ? 'Password must be at least 5 chars long.'
          : this.loginGroup.controls.password.hasError('maxlength')
          ? "Password can't be longer than 9 chars."
          : '';
      default:
        return '';
    }
  }

  public onSubmit(): void {
    this.loginGroup.markAllAsTouched();
    if (this.loginGroup.invalid) return;

    this.auth
      .logIn({
        email: this.loginGroup.value.email as string,
        password: this.loginGroup.value.password as string,
      })
      .pipe(take(1))
      .subscribe(() => {
        this.loginGroup.reset();
        this.router.navigate(['/']);
      });
  }
}
