import express from "express";

import upload from "./upload.route";
import author from "./author.route";
import genre from "./genre.route";
import supplier from "./supplier.route";
import publisher from "./publisher.route";
import category from "./category.route";
import product from "./product.route";
import auth from "./auth.route";
import user from "./user.route";
import cart from "./cart.route";
import bill from "./bill.route";
import review from "./review.route";
import { apiKey, permissions } from "../app/auth/checkAuth";

const router = express.Router();

router.use(apiKey);
router.use(permissions("0000"));

const appRouters = [
  auth,
  upload,
  author,
  supplier,
  publisher,
  genre,
  category,
  product,
  cart,
  bill,
  review,
  user,
];
appRouters.forEach((route) => router.use(route));

export default router;
