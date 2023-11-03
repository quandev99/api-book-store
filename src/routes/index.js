import express from "express";

import upload from "./upload.route";
import author from "./author.route";
import genre from "./genre.route";
import supplier from "./supplier.route";
import publisher from "./publisher.route";
import category from "./category.route";
import product from "./product.route";
import auth from "./author.route";
import user from "./user.route";
import cart from "./cart.route";

const router = express.Router();

const appRouters = [
  upload,
  author,
  supplier,
  publisher,
  genre,
  category,
  product,
];
appRouters.forEach((route) => router.use(route));

export default router;
