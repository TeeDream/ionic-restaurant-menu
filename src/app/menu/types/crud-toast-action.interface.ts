import { ProductActionType } from '@src/app/menu/enums/product-action-type';
import { ProductActionResult } from '@src/app/menu/enums/product-action-result';

export interface CrudToastActionInterface {
  action: ProductActionType;
  result: ProductActionResult;
}
