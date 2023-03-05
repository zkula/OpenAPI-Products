import config from "config";
import { CreateTableCommand, DeleteTableCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { iocContainer } from "../../src/ioc";
import { ProductsRepository } from "../../src/api/product/ProductsRepository";

//Point DynamoDBClient to Docker endpoint
export const client = new DynamoDBClient(config.get("dynamodb"));

export const createProductsTable = async () => {
  //Create new 'Products' table
  try {
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
  } catch (err) {
    console.log("err", err);
  }
};

export const deleteProductsTable = async () => {
  try {
    await client.send(
      new DeleteTableCommand({
        TableName: config.get("dbTables.products.name"),
      }),
    );
  } catch (err) {
    console.log("err", err);
  }
};

export const getProductsRepository = () => iocContainer.get<ProductsRepository>("ProductsRepository");
