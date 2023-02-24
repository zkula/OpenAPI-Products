import { AttributeValue } from "@aws-sdk/client-dynamodb";
import { createProduct } from "../../../test/helpers/createProduct";
import { mapDynamoDBItemToProduct } from "./ProductsRepositoryDynamoDB";

describe("mapDynamoDBItemToProduct", () => {
  it("maps DynamoDB Item to Product object", () => {
    const expectedProduct = createProduct();
    const item: Record<string, AttributeValue> = {
      ProductID: { S: expectedProduct.id },
      Name: { S: expectedProduct.name },
      Description: { S: expectedProduct.description },
      Price: { N: String(expectedProduct.price) },
      CreatedAt: { N: expectedProduct.createdAt.getTime().toString() },
    };

    const output = mapDynamoDBItemToProduct(item);

    expect(output).toEqual(expectedProduct);
  });
});
