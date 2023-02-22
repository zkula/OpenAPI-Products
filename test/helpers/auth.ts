import { sign } from "jsonwebtoken";
import config from "config";
import { request } from "./app";

export const getAuthToken = (uuid: string) => {
  return `Bearer ${sign({ uuid }, config.get("authSecret"))}`;
};

export const testUnauthorized = (endpoint: string, method: "post" | "get" | "put" | "delete", reqBody: object) => {
  it("responds with 401 status code and unauthorized error message if auth token is invalid", async () => {
    const response = await request[method](endpoint).send(reqBody);

    expect(response.body).toHaveProperty("type", "UNAUTHORIZED");
    expect(response.statusCode).toEqual(401);
  });
};
