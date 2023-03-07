import { v4 } from "uuid";
import { ProductsController } from "../../src/api/product/ProductsController";
import { iocContainer } from "../../src/ioc";
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
    beforeAll(async () => {
      iocContainer.snapshot();
      iocContainer.rebind(ProductsController).toSelf();
    });

    afterAll(async () => {
      iocContainer.restore();
    });

    testUnauthorized(endpoint, "get");

    it("responds with 200 status code and the list of all of the products", async () => {
      const products = [createProduct(), createProduct()];

      const expectedProducts = products.map((product) => ({
        ...product,
        createdAt: product.createdAt.toISOString(),
      }));

      const productsRepositoryStub = {
        fetchAll: jest.fn(),
      };

      iocContainer.rebind("ProductsRepository").toConstantValue(productsRepositoryStub);
      productsRepositoryStub.fetchAll.mockResolvedValue(products);

      const response = await request.get(endpoint).set("Authorization", getAuthToken(v4()));

      expect(response.body.products).toEqual(expectedProducts);
      expect(response.statusCode).toEqual(200);
    });
  });
});
