import { AttributeValue, DynamoDBClient, GetItemCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";
import config from "config";
import { v4 } from "uuid";
import { NewProduct, Product } from "./Product";
import { ProductsRepository } from "./ProductsRepository";
import { unmarshall } from "@aws-sdk/util-dynamodb";

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

  async create(newProduct: NewProduct): Promise<Product> {
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

  async update(product: Product): Promise<Product | undefined> {
    const existingProduct = await this.fetchById(product.id);
    if (!existingProduct) {
      return undefined;
    }

    await this.client.send(
      new PutItemCommand({
        TableName: config.get("dbTables.products.name"),
        Item: mapProductToDynamoDBItem({ ...product, createdAt: existingProduct.createdAt }),
      }),
    );

    return product;
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
}
