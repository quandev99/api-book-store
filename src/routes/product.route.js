import express from "express";
import { createProduct, getAllProducts, getProductById, updateProduct } from "../app/controllers/product.controller";
import { verifyTokenAndAdminAuth } from "../app/middlewares/auth.middleware";

const router = express.Router();

router.patch("/products/:id/update", verifyTokenAndAdminAuth, updateProduct);
router.get("/products/:id/getById", verifyTokenAndAdminAuth, getProductById);
router.post("/products/add", verifyTokenAndAdminAuth, createProduct);
router.get("/products", getAllProducts);

export default router;
