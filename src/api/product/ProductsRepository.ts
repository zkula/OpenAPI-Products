import { ProductData, Product } from "./Product";

export interface ProductsRepository {
  create(newProduct: ProductData): Promise<Product>;
  fetchById(id: string): Promise<Product | undefined>;
  update(id: string, product: ProductData): Promise<Product | undefined>;
  delete(id: string): Promise<Product | undefined>;
}
