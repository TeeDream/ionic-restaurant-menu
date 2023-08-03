import { CategoryInterface } from "./category.interface";

export interface ProductInterface {
  id: string;
  price: number;
  name: string;
  description?: string;
  categoryId: string;
  hot?: boolean;
  category: CategoryInterface;
}
