import express from "express";
import { addCheckedAllProduct, addCheckedProduct, addToCart, decreaseQuantity, deleteAllCart, getCartByUser, increaseQuantity, removeCartItem, updateCartItem } from "../app/controllers/cart.controller";
import {
  verifyToken,
} from "../app/middlewares/auth.middleware";
const router = express.Router();

router.post("/carts/add", verifyToken, addToCart);
router.post("/carts/addCheckedProduct", verifyToken, addCheckedProduct);
router.post("/carts/addCheckedAllProduct", verifyToken, addCheckedAllProduct);
router.patch("/carts/remove", verifyToken, removeCartItem);
router.post("/carts/increase", verifyToken, increaseQuantity);
router.post("/carts/decrease", verifyToken, decreaseQuantity);
router.patch("/carts/deleteAll/:id", verifyToken, deleteAllCart);
router.get("/carts/getCartByUser/:id", verifyToken, getCartByUser);
router.patch("/carts/update", verifyToken,  updateCartItem);

export default router;
