import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { DataService } from '@src/app/core/services/data.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CategoryInterface } from '@src/app/core/types';
import { ProductActionState } from '@src/app/menu/enums/product-action.state';

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
  @Output() setProductToastOpen: EventEmitter<ProductActionState> =
    new EventEmitter<ProductActionState>();
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
          this.setProductToastOpen.emit(ProductActionState.CREATE_SUCCESS);
          this.dataService.renewProducts$.next();
        },
        error: () => {
          this.setProductToastOpen.emit(ProductActionState.CREATE_FAILURE);
        },
      });
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (this.storeCategories?.length) {
      this.createProductGroup
        .get('category')
        ?.setValue(this.storeCategories[0].id);
    }
  }
}
