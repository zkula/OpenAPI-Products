import { NewProduct, Product } from "./Product";

export interface ProductsRepository {
  create(newProduct: NewProduct): Promise<Product>;
}
