import { response } from "express";
import { v4 } from "uuid";
import { Product, ProductData } from "../../src/api/product/Product";
import { request } from "../helpers/app";
import { getAuthToken, testUnauthorized } from "../helpers/auth";
import { createProduct } from "../helpers/createProduct";
import {
  createProductsTableIfDoesNotExist,
  clearProductsTable,
  client,
  getProductsRepository,
} from "../helpers/productsTable";

const endpoint = "/product";

describe("Product", () => {
  beforeAll(async () => {
    await createProductsTableIfDoesNotExist();
    await clearProductsTable();
  });

  describe("GET /product/{id}", () => {
    testUnauthorized(`${endpoint}/${v4()}`, "get");

    it("responds with 200 status code and product data if product with given id exists in database", async () => {
      const newProduct: ProductData = createProduct({ id: undefined, createdAt: undefined });
      const expectedProduct = await getProductsRepository().create(newProduct);
      const expectedProductResponseBody = {
        product: { ...expectedProduct, createdAt: expectedProduct.createdAt.toISOString() },
      };

      const response = await request.get(`${endpoint}/${expectedProduct.id}`).set("Authorization", getAuthToken(v4()));

      expect(response.body).toEqual(expectedProductResponseBody);
      expect(response.statusCode).toEqual(200);
    });

    it("responds with 404 status code and not found message if the product with given id does not exist", async () => {
      const response = await request.get(`${endpoint}/${v4()}`).set("Authorization", getAuthToken(v4()));

      expect(response.body.type).toEqual("PRODUCT_NOT_FOUND");
      expect(response.statusCode).toEqual(404);
    });
  });

  describe("PUT /product/{id}", () => {
    testUnauthorized(`${endpoint}/${v4()}`, "put", {
      product: createProduct({
        id: undefined,
        createdAt: undefined,
      }),
    });

    it("reponds with a 200 status code and updated product data if product has been updated successfully", async () => {
      const oldProduct: ProductData = createProduct({ id: undefined, createdAt: undefined });
      const newProduct: ProductData = createProduct({
        id: undefined,
        createdAt: undefined,
      });
      const requestBody = {
        product: newProduct,
      };
      const expectedProduct = await getProductsRepository().create(oldProduct);
      const expectedProductResponseBody = {
        product: { ...newProduct, id: expectedProduct.id, createdAt: expectedProduct.createdAt.toISOString() },
      };

      const response = await request
        .put(`${endpoint}/${expectedProduct.id}`)
        .set("Authorization", getAuthToken(v4()))
        .send(requestBody);

      expect(response.body).toEqual(expectedProductResponseBody);
      expect(response.statusCode).toEqual(200);
    });

    it("responds with 404 status code and not found error message if product does not exist", async () => {
      const product = createProduct();
      const response = await request
        .put(`${endpoint}/${v4()}`)
        .set("Authorization", getAuthToken(v4()))
        .send({ product: createProduct({ id: undefined, createdAt: undefined }) });

      expect(response.body.type).toEqual("PRODUCT_NOT_FOUND");
      expect(response.statusCode).toEqual(404);
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
        product: createProduct({ id: undefined, createdAt: undefined }),
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

  describe("DELETE /product/{id}", () => {
    testUnauthorized(`${endpoint}/${v4()}`, "delete");

    it("responds with 204 status code if the product has been deleted successfully", async () => {
      const createdProduct: Product = createProduct({ id: undefined, createdAt: undefined });
      const expectedProduct = await getProductsRepository().create(createdProduct);

      const deleteResponse = await request
        .delete(`${endpoint}/${expectedProduct.id}`)
        .set("Authorization", getAuthToken(v4()));

      expect(deleteResponse.statusCode).toEqual(204);

      const getResponse = await request
        .get(`${endpoint}/${expectedProduct.id}`)
        .set("Authorization", getAuthToken(v4()));

      expect(getResponse.body.type).toEqual("PRODUCT_NOT_FOUND");
      expect(getResponse.status).toEqual(404);
    });

    it("responds with 404 status code and not found error message if product does not exist", async () => {
      const response = await request.delete(`${endpoint}/${v4()}`).set("Authorization", getAuthToken(v4()));

      expect(response.body.type).toEqual("PRODUCT_NOT_FOUND");
      expect(response.statusCode).toEqual(404);
    });
  });
});
