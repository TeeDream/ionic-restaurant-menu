import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CategoryInterface, ProductInterface } from '@src/app/core/types';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DataService } from '@src/app/core/services/data.service';
import { Observable } from 'rxjs';
import { CrudToastActionInterface } from '@src/app/menu/types/crud-toast-action.interface';
import { ProductActionType } from '@src/app/menu/enums/product-action-type';
import { ProductActionResult } from '@src/app/menu/enums/product-action-result';

@Component({
  selector: 'app-product-edit-modal',
  templateUrl: './product-edit-modal.component.html',
  styleUrls: ['./product-edit-modal.component.scss'],
})
export class ProductEditModalComponent implements OnInit {
  @Input() isProductModalOpen!: boolean;
  @Input() storeCategories!: CategoryInterface[] | null;
  @Output() setModifyProductOpen: EventEmitter<boolean> =
    new EventEmitter<boolean>();
  @Output() setProductToast: EventEmitter<CrudToastActionInterface> =
    new EventEmitter<CrudToastActionInterface>();
  @Input() notify$!: Observable<ProductInterface>;
  public modifyProductGroup: FormGroup | null = null;
  public selectedProductToModify: ProductInterface | null = null;

  constructor(private dataService: DataService) {}

  public onDismiss(): void {
    this.modifyProductGroup?.reset();
    this.setModifyProductOpen.emit(false);
  }

  public onChangesSubmit(): void {
    this.modifyProductGroup?.markAllAsTouched();

    if (
      !this.selectedProductToModify ||
      !this.modifyProductGroup ||
      this.modifyProductGroup.invalid
    ) {
      return;
    }

    const controls = this.modifyProductGroup.controls;

    this.dataService
      .updateProduct(this.selectedProductToModify.id, {
        price: controls['price'].value as number,
        name: controls['name'].value as string,
        description: controls['description'].value as string,
        categoryId: controls['category'].value as string,
      })
      .subscribe({
        next: () => {
          this.dataService.renewProducts$.next();
          this.modifyProductGroup?.reset();
          this.setModifyProductOpen.emit(false);
          this.setProductToast.emit({
            action: ProductActionType.MODIFY,
            result: ProductActionResult.SUCCESS,
          });
        },
        error: (error) => {
          this.setProductToast.emit({
            action: ProductActionType.MODIFY,
            result: ProductActionResult.FAILURE,
          });
        },
      });
  }

  public ngOnInit(): void {
    this.notify$.subscribe((data) => {
      if (!data) return;

      this.selectedProductToModify = data;
      this.modifyProductGroup = new FormGroup({
        name: new FormControl(this.selectedProductToModify.name, [
          Validators.required,
        ]),
        price: new FormControl(this.selectedProductToModify.price, [
          Validators.required,
        ]),
        category: new FormControl(this.selectedProductToModify.category.id, [
          Validators.required,
        ]),
        description: new FormControl(this.selectedProductToModify.description),
      });
    });
  }
}
