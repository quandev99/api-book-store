import express from "express";
import { createProduct, getAllProducts, getProductByCategory, getProductById, updateProduct } from "../app/controllers/product.controller";
import { verifyTokenAndAdminAuth } from "../app/middlewares/auth.middleware";

const router = express.Router();

router.get("/products", getAllProducts);
router.patch("/products/:id/update", verifyTokenAndAdminAuth, updateProduct);
router.get("/products/:id/getById", getProductById);
router.get("/products/:id/getByCate", getProductByCategory);
router.post("/products/add", verifyTokenAndAdminAuth, createProduct);

export default router;
