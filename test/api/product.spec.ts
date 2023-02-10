import { AttributeValue, DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { v4 } from "uuid";
import { request } from "../helpers/app";

describe("Products", () => {
  describe("POST /product", () => {
    it("responds with 201 status code and newly created product data if product has been created successfully", async () => {
      const requestBody = {
        product: {
          name: `product-name-${v4()}`,
          description: `product-description-${v4()}`,
          price: Math.random() * 50,
        },
      };

      const expectedResponseBody = {
        product: {
          ...requestBody.product,
          id: expect.anything(),
          createdAt: expect.anything(),
        },
      };

      const response = await request.post("/product").send(requestBody);

      expect(response.body).toEqual(expectedResponseBody);
      expect(new Date().getTime() - new Date(response.body.product.createdAt).getTime()).toBeLessThan(1000);
      expect(response.statusCode).toEqual(201);
      expect(typeof response.body.product.id).toEqual("string");
    });

    it("stores product in database", async () => {
      const product = {
        name: `product-name-${v4()}`,
        description: `product-description-${v4()}`,
        price: Math.random() * 50,
      };

      const requestBody = {
        product,
      };

      const response = await request.post("/product").send(requestBody);

      const client = new DynamoDBClient({});
      const expectedProduct = response.body.product;
      const output = await client.send(
        new GetItemCommand({
          TableName: "Products",
          Key: {
            ProductId: { S: response.body.product.id },
          },
        }),
      );

      expect(output.Item).not.toBeUndefined();
      const item = output.Item as Record<string, AttributeValue>;
      expect(item["ProductId"].S).toEqual(expectedProduct.id);
      expect(item["Name"].S).toEqual(expectedProduct.name);
      expect(item["Description"].S).toEqual(expectedProduct.description);
      expect(item["Price"].N).toEqual(expectedProduct.price);
      expect(item["CreatedAt"].N).toEqual(String(expectedProduct.createdAt));
    });
  });
});
