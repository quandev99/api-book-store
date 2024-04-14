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
import favorite from "./favorite.route";
import payment from "./payment.route";
import client from "./client.route";
import template from "./template.route";
import discount from "./discount.route";
import oauth from "./oauth.route";
import { apiKey, permissions } from "../app/auth/checkAuth";
const router = express.Router();
router.use(auth);
router.use(client);
router.use(oauth);
router.use(discount);
router.use(template);
router.use(payment);
router.use(apiKey);
router.use(permissions("0000"));

const appRouters = [
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
  favorite,
  user,
];
router.use(...appRouters.map((route) => route));
// appRouters.forEach((route) => router.use(route));

export default router;
