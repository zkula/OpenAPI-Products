export interface Product {
  id: string;
  createdAt: Date;
  name: string;
  description: string;
  price: number;
}

export interface NewProduct extends Omit<Product, "id" | "createdAt"> {}
