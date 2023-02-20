import config from "config";
import { CreateTableCommand, DeleteTableCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";

//Point DynamoDBClient to Docker endpoint
export const client = new DynamoDBClient(config.get("dynamodb"));

export const createProductsTable = async () => {
  //Create new 'Products' table
  await client.send(
    new CreateTableCommand({
      TableName: "Products",
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
};

export const deleteProductsTable = async () => {
  await client.send(
    new DeleteTableCommand({
      TableName: config.get("dbTables.products.name"),
    }),
  );
};