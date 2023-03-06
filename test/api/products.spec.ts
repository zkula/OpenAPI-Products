import { v4 } from "uuid";
import { request } from "../helpers/app";
import { getAuthToken, testUnauthorized } from "../helpers/auth";
import { createProduct } from "../helpers/createProduct";
import {
  createProductsTableIfDoesNotExist,
  clearProductsTable,
  client,
  getProductsRepository,
} from "../helpers/productsTable";

const endpoint = "/products";

describe("Products", () => {
  describe("GET /products", () => {
    beforeEach(async () => {
      await createProductsTableIfDoesNotExist();
      await clearProductsTable();
    });

    testUnauthorized(endpoint, "get");

    it("responds with 200 status code and the list of all of the products", async () => {
      const productsData = [createProduct(), createProduct()];

      const expectedProducts = await Promise.all(
        productsData.map(async (data) => {
          const product = await getProductsRepository().create(data);
          return {
            ...product,
            createdAt: product.createdAt.toISOString(),
          };
        }),
      );

      const response = await request.get(endpoint).set("Authorization", getAuthToken(v4()));

      expect(response.body.products).toEqual(expectedProducts);
      expect(response.statusCode).toEqual(200);
    });
  });
});
