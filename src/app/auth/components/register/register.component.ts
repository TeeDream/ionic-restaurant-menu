import { Component } from '@angular/core';
import {
  AbstractControlOptions,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { AuthService } from '@src/app/auth/services/auth.service';
import { Router } from '@angular/router';
import { MustMatch } from '@src/app/auth/components/register/must-match';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  public hidePassword = true;
  public registerGroup = new FormGroup(
    {
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(9),
        Validators.pattern(/^[a-zA-Z0-9]+$/),
      ]),
      confirmPassword: new FormControl('', [Validators.required]),
    },
    {
      validators: MustMatch('password', 'confirmPassword'),
    } as AbstractControlOptions
  );

  constructor(private auth: AuthService, private router: Router) {}

  getErrorMessage(field: 'email' | 'password' | 'confirmPassword'): string {
    const controls = this.registerGroup.controls;

    switch (field) {
      case 'email':
        return controls.email.hasError('required')
          ? 'Email is required'
          : controls.email.hasError('email')
          ? 'Please enter a valid email address'
          : '';

      case 'password':
        return controls.password.hasError('required')
          ? 'Password is required'
          : controls.password.hasError('pattern')
          ? 'Please use only a-z in any case and numbers.'
          : controls.password.hasError('maxlength')
          ? "Password can't be longer than 9 chars."
          : controls.password.hasError('minlength')
          ? 'Password must be at least 5 chars long.'
          : '';

      case 'confirmPassword':
        return this.registerGroup.hasError('mustMatch')
          ? 'Confirm password must be the same as password.'
          : controls.confirmPassword.hasError('required')
          ? 'Confirm password is required'
          : '';

      default:
        return '';
    }
  }

  public onSubmit(): void {
    this.registerGroup.markAllAsTouched();
    if (this.registerGroup.invalid) return;

    this.auth
      .registerUser({
        email: this.registerGroup.value.email as string,
        password: this.registerGroup.value.password as string,
      })
      .subscribe(() => {
        this.registerGroup.reset();
        this.router.navigate(['/']);
      });
  }
}
