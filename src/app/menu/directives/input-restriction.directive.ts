import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appInputRestriction]',
})
export class InputRestrictionDirective {
  @HostListener('keydown', ['$event']) handleKeyDown(
    e: KeyboardEvent
  ): boolean {
    if (this.checkKeys(e.code)) return true;

    e.preventDefault();
    return false;
  }

  checkKeys(code: string): boolean {
    const forbiddenKeys = ['Minus', 'KeyE', 'Equal', 'Plus'];

    return !forbiddenKeys.includes(code);
  }
}
