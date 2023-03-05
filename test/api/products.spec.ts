import { v4 } from "uuid";
import { request } from "../helpers/app";
import { getAuthToken, testUnauthorized } from "../helpers/auth";
import { createProduct } from "../helpers/createProduct";
import { createProductsTable, deleteProductsTable, client, getProductsRepository } from "../helpers/productsTable";

const endpoint = "/products";

describe("Products", () => {
  beforeAll(async () => {
    await createProductsTable();
  });

  afterAll(async () => {
    //Clean up
    await deleteProductsTable();
  });

  describe("GET /products", () => {
    beforeAll(async () => {
      await deleteProductsTable();
      await createProductsTable();
    });

    testUnauthorized("/products", "get");

    it("responds with 200 status code and the list of all of the products", async () => {
      const productsData = [createProduct(), createProduct()];

      const expectedProducts = await Promise.all(
        productsData.map(async (product) => {
          await getProductsRepository().create(product);
        }),
      );

      const response = await request.get("/products").set("Authorization", getAuthToken(v4()));

      expect(response.body.products).toEqual(productsData);
      expect(response.statusCode).toEqual(200);
    });
  });
});
