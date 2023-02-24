import { AttributeValue } from "@aws-sdk/client-dynamodb";
import { createProduct } from "../../../test/helpers/createProduct";
import { mapProductToDynamoDBItem } from "./ProductsRepositoryDynamoDB";

describe("mapProductToDynamoDBItem", () => {
  it("maps Product object to DynamoDB Item", () => {
    const product = createProduct();

    const expectedItem: Record<string, AttributeValue> = {
      ProductID: { S: product.id },
      Name: { S: product.name },
      Description: { S: product.description },
      Price: { N: String(product.price) },
      CreatedAt: { N: product.createdAt.getTime().toString() },
    };

    const actualItem = mapProductToDynamoDBItem(product);

    expect(actualItem).toEqual(expectedItem);
  });
});
