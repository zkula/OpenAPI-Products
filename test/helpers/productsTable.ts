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
import { createProductsTableIfDoesNotExist as createProductsTable } from "../../src/util/createProductsTableIfDoesNotExist";

//Point DynamoDBClient to Docker endpoint
export const client = new DynamoDBClient(config.get("dynamodb"));

export const createProductsTableIfDoesNotExist = () => createProductsTable(client);

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
