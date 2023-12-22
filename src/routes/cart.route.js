import express from "express";
import { addCheckedProduct, addToCart, deleteAllCart, getCartByUser, removeCartItem, updateCartItem } from "../app/controllers/cart.controller";
import {
  verifyToken,
} from "../app/middlewares/auth.middleware";
const router = express.Router();

router.post("/carts/add", verifyToken, addToCart);
router.post("/carts/addCheckedProduct", verifyToken, addCheckedProduct);
router.patch("/carts/remove", verifyToken, removeCartItem);
router.patch("/carts/deleteAll/:id", verifyToken, deleteAllCart);
router.get("/carts/getCartByUser/:id", verifyToken, getCartByUser);
router.patch("/carts/update", verifyToken,  updateCartItem);

export default router;
