export interface Product {
  id: string;
  createdAt: Date;
  name: string;
  description: string;
  price: number;
}

export interface ProductData extends Omit<Product, "id" | "createdAt"> {}
