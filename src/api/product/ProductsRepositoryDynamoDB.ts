import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { v4 } from "uuid";
import { NewProduct, Product } from "./Product";
import { ProductsRepository } from "./ProductsRepository";

export class ProductsRepositoryDynamoDB implements ProductsRepository {
  async create(newProduct: NewProduct): Promise<Product> {
    const product = {
      ...newProduct,
      id: v4(),
      createdAt: new Date(),
    };

    const client = new DynamoDBClient({
      endpoint: "http://localhost:8000",
    });

    await client.send(
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
