
import express from "express";
import { applyDiscountToCart, createDiscount, getAllDiscounts, removeDiscount, unDiscountCart, updateDiscount } from "../app/controllers/discount.controller";

const router = express.Router();
router.get("/discounts", getAllDiscounts);
router.get("/discounts/byUser", getAllDiscounts);
router.delete("/discounts/unDiscount", unDiscountCart);
router.delete("/discounts/:id", removeDiscount);
router.post("/discounts/apply", applyDiscountToCart);
router.post("/discounts/create", createDiscount);
router.patch("/discounts/:id/update", updateDiscount);


export default router;