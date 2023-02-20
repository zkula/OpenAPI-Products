import { NewProduct, Product } from "../../src/api/product/Product";
import { ProductsRepositoryDynamoDB } from "../../src/api/product/ProductsRepositoryDynamoDB";
import { createProduct } from "../helpers/createProduct";

const getRepository = () => new ProductsRepositoryDynamoDB();

describe("ProductsRepositoryDynamoDB", () => {
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

      expect(actual).toEqual(expectedProduct);
      expect(typeof actual.id).toBe("string");
      expect(actual.createdAt).toBeInstanceOf(Date);
      expect(new Date().getTime() - actual.createdAt.getTime()).toBeLessThan(1000);
    });
  });
});
