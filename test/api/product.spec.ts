import { v4 } from "uuid";
import { NewProduct } from "../../src/api/product/Product";
import { request } from "../helpers/app";
import { getAuthToken, testUnauthorized } from "../helpers/auth";
import { createProduct } from "../helpers/createProduct";
import { createProductsTable, deleteProductsTable, client, getProductsRepository } from "../helpers/productsTable";

const endpoint = "/product";

describe("Products", () => {
  beforeAll(async () => {
    await createProductsTable();
  });

  afterAll(async () => {
    //Clean up
    await deleteProductsTable();
  });

  describe("GET /product/{id}", () => {
    testUnauthorized(`${endpoint}/${v4()}`, "get");

    it("responds with 200 status code and product data if product with given id exists in database", async () => {
      const newProduct: NewProduct = createProduct({ id: undefined, createdAt: undefined });
      const expectedProduct = await getProductsRepository().create(newProduct);
      const expectedProductResponseBody = {
        product: { ...expectedProduct, createdAt: expectedProduct.createdAt.toISOString() },
      };

      const response = await request.get(`${endpoint}/${expectedProduct.id}`).set("Authorization", getAuthToken(v4()));

      expect(response.body).toEqual(expectedProductResponseBody);
      expect(response.status).toEqual(200);
    });
  });

  describe("POST /product", () => {
    testUnauthorized(endpoint, "post", {
      product: createProduct({
        id: undefined,
        createdAt: undefined,
      }),
    });

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

      const response = await request.post(endpoint).set("Authorization", getAuthToken(v4())).send(requestBody);
      const responseBodyProduct = response.body.product;
      const actualProduct = await getProductsRepository().fetchById(response.body.product.id);

      expect(response.body).toEqual(expectedResponseBody);
      expect(new Date().getTime() - new Date(responseBodyProduct.createdAt).getTime()).toBeLessThan(5000);
      expect(response.statusCode).toEqual(201);
      expect(typeof responseBodyProduct.id).toEqual("string");
      expect(actualProduct).toEqual({ ...responseBodyProduct, createdAt: new Date(responseBodyProduct.createdAt) });
    });

    it("responds with 422 status code and validation error if product is empty", async () => {
      const response = await request.post(endpoint).set("Authorization", getAuthToken(v4())).send({
        product: {},
      });

      expect(response.statusCode).toEqual(422);
      expect(response.body).toEqual({
        details: {
          "reqBody.product.description": {
            message: "'description' is required",
          },
          "reqBody.product.name": {
            message: "'name' is required",
          },
          "reqBody.product.price": {
            message: "'price' is required",
          },
        },
        message: "validation failed",
      });
    });
  });
});
