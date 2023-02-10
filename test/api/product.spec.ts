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

      const response = await request
        .post("/product")
        // .set("Authorization", getAuthToken(expectedProduct.id)) TODO - add authorization
        .send(requestBody);

      expect(response.body).toEqual(expectedResponseBody);
      expect(new Date().getTime() - new Date(response.body.product.createdAt).getTime()).toBeLessThan(1000);
      expect(response.statusCode).toEqual(201);
      expect(typeof response.body.product.id).toEqual("string");
    });
  });
});
