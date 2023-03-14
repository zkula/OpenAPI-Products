import { inject } from "inversify";
import { Body, Controller, Delete, Get, Path, Post, Put, Response, Route, Security, SuccessResponse, Tags } from "tsoa";
import securities from "../auth/securities";
import { provideSingleton } from "../../util/provideSingleton";
import { Product, ProductData } from "./Product";
import { ProductsRepository } from "./ProductsRepository";
import { ApiError, ApiErrorJSON } from "../ApiError";

export type ProductRequestBody = {
  product: ProductData;
};

export type ProductResponseBody = {
  product: Product;
};

@Tags("product")
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

  /**
   * Deletes a product from database if the product exists
   * @summary deletes product
   * @param id product identifier
   * @example id "7b891531-8daa-476b-9b8e-7a9695127b0f"
   */
  @Response<ApiErrorJSON>(404, "Error: Not Found", {
    message: "product not found",
    type: "PRODUCT_NOT_FOUND",
  })
  @Delete("{id}")
  @Security(securities.USER_AUTH)
  public async deleteProduct(@Path("id") id: string): Promise<void> {
    const deleted = await this.productsRepository.delete(id);

    if (!deleted) {
      throw new ApiError({
        statusCode: 404,
        message: "product not found",
        type: "PRODUCT_NOT_FOUND",
      });
    }
  }
}
