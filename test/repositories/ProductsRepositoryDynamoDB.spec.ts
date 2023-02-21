import { AttributeValue, GetItemCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";
import config from "config";
import { v4 } from "uuid";
import { NewProduct, Product } from "../../src/api/product/Product";
import { ProductsRepositoryDynamoDB } from "../../src/api/product/ProductsRepositoryDynamoDB";
import { createProduct } from "../helpers/createProduct";
import { client, createProductsTable, deleteProductsTable } from "../helpers/productsTable";

const getRepository = () => new ProductsRepositoryDynamoDB();

describe("ProductsRepositoryDynamoDB", () => {
  beforeAll(async () => {
    await createProductsTable();
  });

  afterAll(async () => {
    //Clean up
    await deleteProductsTable();
  });

  describe("create", () => {
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

  describe("fetchById", () => {
    it("Returns undefined if the product with given id does not exist", async () => {
      const id = v4();
      const actual = await getRepository().fetchById(id);

      expect(actual).toEqual(undefined);
    });

    it("Returns a product if product with given id exists in the database", async () => {
      const product = createProduct();

      const output = await client.send(
        new PutItemCommand({
          TableName: config.get("dbTables.products.name"),
          Item: {
            ProductID: { S: product.id },
            Name: { S: product.name },
            Description: { S: product.description },
            Price: { N: String(product.price) },
            CreatedAt: { N: product.createdAt.getTime().toString() },
          },
        }),
      );

      const actual = await getRepository().fetchById(product.id);

      expect(actual).toEqual(product);
      // expect(typeof actual.id).toBe("string");
      // expect(actual.createdAt).toBeInstanceOf(Date);
      // expect(new Date().getTime() - actual.createdAt.getTime()).toBeLessThan(1000);
      // expect(output.Item).not.toBeUndefined();
      // const item = output.Item as Record<string, AttributeValue>;
      // expect(item["ProductID"].S).toEqual(actual.id);
      // expect(item["Name"].S).toEqual(expectedProduct.name);
      // expect(item["Description"].S).toEqual(expectedProduct.description);
      // expect(item["Price"].N).toEqual(String(expectedProduct.price));
      // expect(item["CreatedAt"].N).toEqual(String(actual.createdAt.getTime()));
    });
  });
});
