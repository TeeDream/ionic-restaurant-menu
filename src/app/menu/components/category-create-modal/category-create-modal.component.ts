import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DataService } from '@src/app/core/services/data.service';
import { FormControl, Validators } from '@angular/forms';
import { CrudToastActionInterface } from '@src/app/menu/types/crud-toast-action.interface';
import { ProductActionType } from '@src/app/menu/enums/product-action-type';
import { ProductActionResult } from '@src/app/menu/enums/product-action-result';

@Component({
  selector: 'app-category-create-modal',
  templateUrl: './category-create-modal.component.html',
  styleUrls: ['./category-create-modal.component.scss'],
})
export class CategoryCreateModalComponent {
  @Input() isModalOpen!: boolean;
  @Output() setModalOpen: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() openToast: EventEmitter<CrudToastActionInterface> =
    new EventEmitter<CrudToastActionInterface>();
  public categoryName = new FormControl('', [Validators.required]);

  constructor(private dataService: DataService) {}

  public onModalSubmit(): void {
    this.categoryName.markAsTouched();

    if (this.categoryName.invalid || !this.categoryName.value) return;

    this.dataService
      .createCategory({ name: this.categoryName.value })
      .subscribe({
        next: () => {
          this.setModalOpen.emit(false);
          this.openToast.emit({
            action: ProductActionType.CREATE,
            result: ProductActionResult.SUCCESS,
          });
          this.dataService.renewCategories$.next();
        },
        error: () => {
          this.openToast.emit({
            action: ProductActionType.CREATE,
            result: ProductActionResult.FAILURE,
          });
        },
      });
  }
}
