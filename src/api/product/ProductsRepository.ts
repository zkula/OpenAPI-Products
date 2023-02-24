import { NewProduct, Product } from "./Product";

export interface ProductsRepository {
  create(newProduct: NewProduct): Promise<Product>;
  fetchById(id: string): Promise<Product | undefined>;
  update(product: Product): Promise<Product | undefined>;
}
