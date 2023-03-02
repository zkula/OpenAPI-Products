import { inject } from "inversify";
import { Body, Controller, Delete, Get, Path, Post, Put, Route, Security, SuccessResponse } from "tsoa";
import securities from "../auth/securities";
import { provideSingleton } from "../../util/provideSingleton";
import { Product, ProductData } from "./Product";
import { ProductsRepository } from "./ProductsRepository";
import { ApiError } from "../ApiError";

export type ProductRequestBody = {
  product: ProductData;
};

export type ProductResponseBody = {
  product: Product;
};

@Route("product")
@provideSingleton(ProductController)
export class ProductController extends Controller {
  constructor(@inject("ProductsRepository") private productsRepository: ProductsRepository) {
    super();
  }

  @SuccessResponse(201)
  @Security(securities.USER_AUTH)
  @Post()
  public async postProduct(@Body() reqBody: ProductRequestBody): Promise<ProductResponseBody> {
    const product = await this.productsRepository.create(reqBody.product);

    return { product };
  }

  @SuccessResponse(200)
  @Security(securities.USER_AUTH)
  @Put("{id}")
  public async putProduct(
    @Path("id") id: string,
    @Body() reqBody: ProductRequestBody,
  ): Promise<ProductResponseBody | undefined> {
    const product = await this.productsRepository.update(id, reqBody.product);

    if (!product) {
      throw new ApiError({
        statusCode: 404,
        type: "PRODUCT_NOT_FOUND",
      });
    }

    return { product };
  }

  @SuccessResponse(200)
  @Security(securities.USER_AUTH)
  @Get("{id}")
  public async getProduct(@Path("id") id: string): Promise<ProductResponseBody> {
    const product = await this.productsRepository.fetchById(id);

    if (!product) {
      throw new ApiError({
        statusCode: 404,
        type: "PRODUCT_NOT_FOUND",
      });
    }

    return { product };
  }

  @Delete("{id}")
  @Security(securities.USER_AUTH)
  public async deleteProduct(@Path("id") id: string): Promise<void> {
    const deleted = await this.productsRepository.delete(id);

    if (!deleted) {
      throw new ApiError({
        statusCode: 404,
        type: "PRODUCT_NOT_FOUND",
      });
    }
  }
}
