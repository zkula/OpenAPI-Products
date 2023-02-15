import { inject } from "inversify";
import { Body, Controller, Get, Path, Post, Route, Security, SuccessResponse } from "tsoa";

import securities from "../auth/securities";
import { provideSingleton } from "../../util/provideSingleton";
import { Product, NewProduct } from "./Product";
import { v4 } from "uuid";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { ProductsRepositoryDynamoDB } from "./ProductsRepositoryDynamoDB";

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
    const repo = new ProductsRepositoryDynamoDB();

    const product = await repo.create(reqBody.product);

    return { product };
  }
}
