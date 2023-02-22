import { inject } from "inversify";
import { Body, Controller, Get, Path, Post, Route, Security, SuccessResponse } from "tsoa";

import securities from "../auth/securities";
import { provideSingleton } from "../../util/provideSingleton";
import { Product, NewProduct } from "./Product";
import { v4 } from "uuid";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { ProductsRepositoryDynamoDB } from "./ProductsRepositoryDynamoDB";
import { ProductsRepository } from "./ProductsRepository";

export type ProductRequestBody = {
  product: NewProduct;
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
  @Get("{id}")
  public async getProduct(@Path("id") id: string): Promise<ProductResponseBody> {
    const product = (await this.productsRepository.fetchById(id)) as Product;

    return { product };
  }
}
