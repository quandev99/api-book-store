import express from "express";
import { addCheckedAllProduct, addCheckedProduct, addToCart, decreaseQuantity, deleAllCartItem, getCartByUser, getCartByUserChecked,  increaseQuantity, removeCartItem, updateCartItem } from "../app/controllers/cart.controller";
import {
  verifyToken,
  verifyTokenMember,
} from "../app/middlewares/auth.middleware";
const router = express.Router();
router.use(verifyToken);
router.post("/carts/add", verifyTokenMember, addToCart);
router.post("/carts/addCheckedProduct", verifyTokenMember, addCheckedProduct);
router.post("/carts/addCheckedAllProduct", verifyTokenMember, addCheckedAllProduct);
router.patch("/carts/remove", verifyTokenMember, removeCartItem);
router.post("/carts/increase", verifyTokenMember, increaseQuantity);
router.post("/carts/decrease", verifyTokenMember, decreaseQuantity);
router.post("/carts/deleteAllCart", verifyTokenMember, deleAllCartItem);
router.get(
  "/carts/getCartByUser/:id",
  verifyTokenMember,
  getCartByUser
);
// router.get(
//   "/carts/getCartByUserChecked/:id",
//   verifyTokenMember,
//   getCartByUserChecked
// );
router.patch("/carts/update", verifyToken,  updateCartItem);

export default router;
