import { AttributeValue, GetItemCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";
import config from "config";
import { v4 } from "uuid";
import { ProductData, Product } from "../../src/api/product/Product";
import {
  mapDynamoDBItemToProduct,
  mapProductToDynamoDBItem,
  ProductsRepositoryDynamoDB,
} from "../../src/api/product/ProductsRepositoryDynamoDB";
import { createProduct } from "../helpers/createProduct";
import { client, createProductsTable, deleteProductsTable, getProductsRepository } from "../helpers/productsTable";

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
    it("stores a ProductData in the database and returns Product with newly generated id and actual createdAt date", async () => {
      const newProduct: ProductData = createProduct({
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
      expect(new Date().getTime() - actual.createdAt.getTime()).toBeLessThan(5000);

      expect(output.Item).not.toBeUndefined();
      const item = output.Item as Record<string, AttributeValue>;
      const storedProduct = mapDynamoDBItemToProduct(item);

      expect(storedProduct).toEqual({
        ...expectedProduct,
        id: actual.id,
        createdAt: actual.createdAt,
      });
    });
  });

  describe("update", () => {
    it("returns undefined and does not modify anything in database if given product does not exist", async () => {
      const product = createProduct();
      const actual = await getProductsRepository().update(product.id, product);

      expect(actual).toBeUndefined;
    });

    it("updates a product in the database and returns the updated Product if given product exists", async () => {
      const existingProduct = createProduct();

      await client.send(
        new PutItemCommand({
          TableName: config.get("dbTables.products.name"),
          Item: mapProductToDynamoDBItem(existingProduct),
        }),
      );

      const newProductData = createProduct({
        id: undefined,
        createdAt: undefined,
      });

      const expectedProduct = { ...newProductData, id: existingProduct.id, createdAt: existingProduct.createdAt };

      const actual = (await getProductsRepository().update(existingProduct.id, newProductData)) as Product;

      const output = await client.send(
        new GetItemCommand({
          TableName: config.get("dbTables.products.name"),
          Key: {
            ProductID: { S: actual.id },
          },
        }),
      );

      expect(actual).toEqual(expectedProduct);
      expect(output.Item).not.toBeUndefined();
      const item = output.Item as Record<string, AttributeValue>;
      const modifiedProduct = mapDynamoDBItemToProduct(item);
      expect(modifiedProduct).toEqual({
        ...newProductData,
        id: actual.id,
        createdAt: existingProduct.createdAt,
      });
    });
  });

  describe("fetchById", () => {
    it("Returns undefined if the product with given id does not exist", async () => {
      const id = v4();
      const actual = await getRepository().fetchById(id);

      expect(actual).toEqual(undefined);
    });

    it("Returns a product if product with given id exists in the database", async () => {
      const expectedProduct = createProduct();

      await client.send(
        new PutItemCommand({
          TableName: config.get("dbTables.products.name"),
          Item: mapProductToDynamoDBItem(expectedProduct),
        }),
      );

      const actualProduct = await getRepository().fetchById(expectedProduct.id);

      expect(actualProduct).toEqual(expectedProduct);
    });
  });

  describe("delete", () => {
    it("Returns false if the product with given id does not exist in the database", async () => {
      const id = v4();
      const actual = await getRepository().delete(id);

      expect(actual).toBeFalsy();
    });

    it("Returns true if product with given id exists in the database and was deleted successfully", async () => {
      const existingProduct = createProduct();

      await client.send(
        new PutItemCommand({
          TableName: config.get("dbTables.products.name"),
          Item: mapProductToDynamoDBItem(existingProduct),
        }),
      );

      const actual = await getRepository().delete(existingProduct.id);
      const output = await client.send(
        new GetItemCommand({
          TableName: config.get("dbTables.products.name"),
          Key: {
            ProductID: { S: existingProduct.id },
          },
        }),
      );

      expect(actual).toBeTruthy();
      expect(output.Item).toBeUndefined();
    });
  });
});
