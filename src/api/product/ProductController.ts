import { inject } from "inversify";
import { Body, Controller, Get, Path, Post, Route, Security, SuccessResponse } from "tsoa";

import securities from "../auth/securities";
import { provideSingleton } from "../../util/provideSingleton";
import { Product, NewProduct } from "./Product";
import { v4 } from "uuid";

export type ProductRequestBody = {
  product: NewProduct;
};

export type ProductResponseBody = {
  product: Product;
};

@Route("product")
@provideSingleton(ProductController)
export class ProductController extends Controller {
  @SuccessResponse(201)
  @Post()
  public async postProduct(@Body() reqBody: ProductRequestBody): Promise<ProductResponseBody> {
    return Promise.resolve({
      product: {
        ...reqBody.product,
        id: v4(),
        createdAt: new Date(),
      },
    });
  }
}
