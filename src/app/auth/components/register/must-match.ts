import { AbstractControl } from '@angular/forms';

export function MustMatch(controlName: string, matchingControlName: string) {
  return (abstractControl: AbstractControl) => {
    const control = abstractControl.get(controlName);
    const matchingControl = abstractControl.get(matchingControlName);

    if (matchingControl?.errors && !matchingControl.errors['mustMatch'])
      return null;

    control?.value !== matchingControl?.value
      ? matchingControl?.setErrors({ mustMatch: 'Value does not match' })
      : matchingControl?.setErrors(null);

    return control?.value !== matchingControl?.value
      ? { mustMatch: true }
      : null;
  };
}
