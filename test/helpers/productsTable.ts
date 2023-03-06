import config from "config";
import {
  CreateTableCommand,
  DeleteItemCommand,
  DeleteTableCommand,
  DescribeTableCommand,
  DynamoDBClient,
  ResourceNotFoundException,
  ScanCommand,
} from "@aws-sdk/client-dynamodb";
import { iocContainer } from "../../src/ioc";
import { ProductsRepository } from "../../src/api/product/ProductsRepository";

//Point DynamoDBClient to Docker endpoint
export const client = new DynamoDBClient(config.get("dynamodb"));

export const createProductsTableIfDoesNotExist = async () => {
  //Create new 'Products' table
  try {
    await client.send(
      new DescribeTableCommand({
        TableName: config.get("dbTables.products.name"),
      }),
    );
  } catch (e) {
    if (!(e instanceof ResourceNotFoundException)) {
      throw e;
    }

    await client.send(
      new CreateTableCommand({
        TableName: config.get("dbTables.products.name"),
        AttributeDefinitions: [
          {
            AttributeName: "ProductID",
            AttributeType: "S",
          },
        ],
        KeySchema: [
          {
            AttributeName: "ProductID",
            KeyType: "HASH",
          },
        ],
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5,
        },
      }),
    );
  }
};

export const clearProductsTable = async () => {
  const output = await client.send(
    new ScanCommand({
      TableName: config.get("dbTables.products.name"),
    }),
  );

  await Promise.all(
    (output.Items || []).map(async (item) => {
      return client.send(
        new DeleteItemCommand({
          TableName: config.get("dbTables.products.name"),
          Key: {
            ProductID: item["ProductID"],
          },
        }),
      );
    }),
  );
};

export const getProductsRepository = () => iocContainer.get<ProductsRepository>("ProductsRepository");
