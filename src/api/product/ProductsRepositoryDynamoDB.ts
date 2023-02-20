import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { v4 } from "uuid";
import { NewProduct, Product } from "./Product";
import { ProductsRepository } from "./ProductsRepository";

export class ProductsRepositoryDynamoDB implements ProductsRepository {
  private client: DynamoDBClient;

  constructor() {
    this.client = new DynamoDBClient({
      endpoint: "http://localhost:8000",
    });
  }

  async create(newProduct: NewProduct): Promise<Product> {
    const product = {
      ...newProduct,
      id: v4(),
      createdAt: new Date(),
    };

    await this.client.send(
      new PutItemCommand({
        TableName: "Products",
        Item: {
          ProductID: { S: product.id },
          Name: { S: product.name },
          Description: { S: product.description },
          Price: { N: String(product.price) },
          CreatedAt: { N: product.createdAt.getTime().toString() },
        },
      }),
    );

    return product;
  }
}
