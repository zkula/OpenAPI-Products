import { v4 } from "uuid";
import { Product } from "../../src/api/product/Product";

export const createProduct = (product: Partial<Product>): Product => ({
  name: `product-name-${v4()}`,
  description: `product-description-${v4()}`,
  price: Math.random() * 50,
  id: v4(),
  createdAt: new Date(),
  ...product,
});
