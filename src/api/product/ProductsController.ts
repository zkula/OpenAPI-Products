import { inject } from "inversify";
import { Controller, Get, Route, Security, SuccessResponse, Tags } from "tsoa";
import securities from "../auth/securities";
import { provideSingleton } from "../../util/provideSingleton";
import { Product } from "./Product";
import { ProductsRepository } from "./ProductsRepository";
import { ApiError } from "../ApiError";

export type ProductsResponseBody = {
  products: Product[];
};

@Tags("product")
@Route("products")
@provideSingleton(ProductsController)
export class ProductsController extends Controller {
  constructor(@inject("ProductsRepository") private productsRepository: ProductsRepository) {
    super();
  }

  @SuccessResponse(200)
  @Security(securities.USER_AUTH)
  @Get()
  public async listProducts(): Promise<ProductsResponseBody> {
    const products = await this.productsRepository.fetchAll();
    return {
      products,
    };
  }
}
