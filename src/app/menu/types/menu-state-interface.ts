import { CategoryInterface, ProductInterface } from "@src/app/core/types";

export interface MenuStateInterface {
  isLoadingCategories: boolean;
  isLoadingProducts: boolean;
  isLoadingHotProducts: boolean;
  categories: CategoryInterface[];
  products: ProductInterface[];
  hotProducts: ProductInterface[];
  errorCategories: string | null;
  errorProducts: string | null;
  errorHotProducts: string | null;
}
