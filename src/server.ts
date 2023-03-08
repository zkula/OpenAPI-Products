import config from "config";
import { createProductsTableIfDoesNotExist } from "../test/helpers/productsTable";
import { app } from "./app";

const port = config.get("server.port");

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
  createProductsTableIfDoesNotExist();
});
