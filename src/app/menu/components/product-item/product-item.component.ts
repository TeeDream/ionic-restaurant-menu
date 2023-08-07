import { Component, Input } from '@angular/core';
import { CategoryInterface, ProductInterface } from '@src/app/core/types';

@Component({
  selector: 'app-product-item',
  templateUrl: './product-item.component.html',
  styleUrls: ['./product-item.component.scss'],
})
export class ProductItemComponent {
  @Input() product!: ProductInterface;
  @Input() isAuth!: boolean | null;
  @Input() isAdmin!: boolean;
  @Input() isEditing!: boolean;
  @Input() categories!: CategoryInterface[];
}
