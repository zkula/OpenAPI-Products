import { AttributeValue, DynamoDBClient, GetItemCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";
import config from "config";
import { v4 } from "uuid";
import { ProductData, Product } from "./Product";
import { ProductsRepository } from "./ProductsRepository";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { createProduct } from "../../../test/helpers/CreateProduct";

export const mapProductToDynamoDBItem = (product: Product): Record<string, AttributeValue> => {
  return {
    ProductID: { S: product.id },
    Name: { S: product.name },
    Description: { S: product.description },
    Price: { N: String(product.price) },
    CreatedAt: { N: product.createdAt.getTime().toString() },
  };
};

export const mapDynamoDBItemToProduct = (item: Record<string, AttributeValue>): Product => {
  const obj = unmarshall(item);

  return {
    id: obj["ProductID"],
    name: obj["Name"],
    description: obj["Description"],
    price: obj["Price"],
    createdAt: new Date(obj["CreatedAt"]),
  };
};

export class ProductsRepositoryDynamoDB implements ProductsRepository {
  private client: DynamoDBClient;

  constructor() {
    this.client = new DynamoDBClient(config.get("dynamodb"));
  }

  async create(newProduct: ProductData): Promise<Product> {
    const product = {
      ...newProduct,
      id: v4(),
      createdAt: new Date(),
    };

    await this.client.send(
      new PutItemCommand({
        TableName: config.get("dbTables.products.name"),
        Item: mapProductToDynamoDBItem(product),
      }),
    );

    return product;
  }

  async update(id: string, productData: ProductData): Promise<Product | undefined> {
    const existingProduct = await this.fetchById(id);
    if (!existingProduct) {
      return undefined;
    }

    const newProduct = { ...productData, id, createdAt: existingProduct.createdAt };

    await this.client.send(
      new PutItemCommand({
        TableName: config.get("dbTables.products.name"),
        Item: mapProductToDynamoDBItem(newProduct),
      }),
    );

    return newProduct;
  }

  async fetchById(id: string): Promise<Product | undefined> {
    const output = await this.client.send(
      new GetItemCommand({
        TableName: config.get("dbTables.products.name"),
        Key: {
          ProductID: { S: id },
        },
      }),
    );

    if (!output.Item) {
      return undefined;
    }

    return mapDynamoDBItemToProduct(output.Item);
  }

  async delete(id: string): Promise<Product | undefined> {
    return undefined;
  }
}
