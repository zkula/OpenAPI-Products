export interface Product {
  /**
   * @example "7b891531-8daa-476b-9b8e-7a9695127b0f"
   */
  id: string;
  /**
   * @example "2023-03-08T02:51:32.749Z"
   */
  createdAt: Date;
  /**
   * @example "iPhone 12"
   */
  name: string;
  /**
   * @example "Brand new"
   */
  description: string;
  /**
   * @example "1099.99"
   */
  price: number;
}

export interface ProductData extends Omit<Product, "id" | "createdAt"> {}
