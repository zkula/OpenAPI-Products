import { CreateTableCommand, DeleteTableCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";

//Point DynamoDBClient to Docker endpoint
export const client = new DynamoDBClient({
  endpoint: "http://localhost:8000",
});

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
      TableName: "Products",
    }),
  );
};
