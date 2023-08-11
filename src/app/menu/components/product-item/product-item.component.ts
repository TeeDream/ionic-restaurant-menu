import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ProductInterface } from '@src/app/core/types';

@Component({
  selector: 'app-product-item',
  templateUrl: './product-item.component.html',
  styleUrls: ['./product-item.component.scss'],
})
export class ProductItemComponent {
  @Output() openModal: EventEmitter<ProductInterface> =
    new EventEmitter<ProductInterface>();
  @Input() product!: ProductInterface;
  @Input() isAuth!: boolean | null;
  @Input() isAdmin!: boolean;
  @Input() isEditing!: boolean;
  @Output() openDeleteAction: EventEmitter<ProductInterface> =
    new EventEmitter<ProductInterface>();
}
