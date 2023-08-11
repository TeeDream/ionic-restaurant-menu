import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
} from '@angular/core';
import { DataService } from '@src/app/core/services/data.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CategoryInterface } from '@src/app/core/types';
import { CrudToastActionInterface } from '@src/app/menu/types/crud-toast-action.interface';
import { ProductActionResult } from '@src/app/menu/enums/product-action-result';
import { ProductActionType } from '@src/app/menu/enums/product-action-type';

@Component({
  selector: 'app-product-create-modal',
  templateUrl: './product-create-modal.component.html',
  styleUrls: ['./product-create-modal.component.scss'],
})
export class ProductCreateModalComponent implements OnChanges {
  @Input() storeCategories!: CategoryInterface[] | null;
  @Input() isCreateProductModalOpen!: boolean;
  @Output() setCreateProductOpen: EventEmitter<boolean> =
    new EventEmitter<boolean>();
  @Output() setProductToastOpen: EventEmitter<CrudToastActionInterface> =
    new EventEmitter<CrudToastActionInterface>();
  public createProductGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    price: new FormControl(0, [Validators.required]),
    category: new FormControl('', [Validators.required]),
    description: new FormControl(''),
  });

  constructor(private dataService: DataService) {}

  public onCreateSubmit(): void {
    this.createProductGroup.markAllAsTouched();

    if (this.createProductGroup.invalid) return;
    const controls = this.createProductGroup.controls;

    this.dataService
      .createProduct({
        price: controls.price.value as number,
        name: controls.name.value as string,
        description: controls.description.value as string,
        categoryId: controls.category.value as string,
      })
      .subscribe({
        next: () => {
          this.createProductGroup.reset();
          this.setCreateProductOpen.emit(false);
          this.setProductToastOpen.emit({
            result: ProductActionResult.SUCCESS,
            action: ProductActionType.CREATE,
          });
          this.dataService.renewProducts$.next();
        },
        error: () => {
          this.setProductToastOpen.emit({
            result: ProductActionResult.FAILURE,
            action: ProductActionType.CREATE,
          });
        },
      });
  }

  public ngOnChanges(): void {
    if (this.storeCategories?.length) {
      this.createProductGroup
        .get('category')
        ?.setValue(this.storeCategories[0].id);
    }
  }
}
