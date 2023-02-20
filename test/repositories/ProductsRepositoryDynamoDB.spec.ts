import { AttributeValue, GetItemCommand } from "@aws-sdk/client-dynamodb";
import config from "config";
import { NewProduct, Product } from "../../src/api/product/Product";
import { ProductsRepositoryDynamoDB } from "../../src/api/product/ProductsRepositoryDynamoDB";
import { createProduct } from "../helpers/createProduct";
import { client, createProductsTable, deleteProductsTable } from "../helpers/productsTable";

const getRepository = () => new ProductsRepositoryDynamoDB();

describe("ProductsRepositoryDynamoDB", () => {
  describe("create", () => {
    beforeAll(async () => {
      await createProductsTable();
    });

    afterAll(async () => {
      //Clean up
      await deleteProductsTable();
    });

    it("stores a NewProduct in the database and returns Product with newly generated id and actual createdAt date", async () => {
      const newProduct: NewProduct = createProduct({
        id: undefined,
        createdAt: undefined,
      });
      const expectedProduct: Product = {
        ...newProduct,
        id: expect.anything(),
        createdAt: expect.anything(),
      };

      const actual = await getRepository().create(newProduct);

      //Retrieve database product entry
      const output = await client.send(
        new GetItemCommand({
          TableName: config.get("dbTables.products.name"),
          Key: {
            ProductID: { S: actual.id },
          },
        }),
      );

      expect(actual).toEqual(expectedProduct);
      expect(typeof actual.id).toBe("string");
      expect(actual.createdAt).toBeInstanceOf(Date);
      expect(new Date().getTime() - actual.createdAt.getTime()).toBeLessThan(1000);

      expect(output.Item).not.toBeUndefined();
      const item = output.Item as Record<string, AttributeValue>;
      expect(item["ProductID"].S).toEqual(actual.id);
      expect(item["Name"].S).toEqual(expectedProduct.name);
      expect(item["Description"].S).toEqual(expectedProduct.description);
      expect(item["Price"].N).toEqual(String(expectedProduct.price));
      expect(item["CreatedAt"].N).toEqual(String(actual.createdAt.getTime()));
    });
  });
});
