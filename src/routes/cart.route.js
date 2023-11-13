import express from "express";
import { addToCart, deleteAllCart, getCartByUser, removeCartItem, updateCartItem } from "../app/controllers/cart.controller";

const router = express.Router();

router.post("/carts/add",addToCart)
router.patch("/carts/remove", removeCartItem);
router.patch("/carts/deleteAll/:id", deleteAllCart);
router.get("/carts/getById/:id", getCartByUser);
router.patch("/carts/update", updateCartItem);

export default router;
