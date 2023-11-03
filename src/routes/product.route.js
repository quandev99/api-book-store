import express from "express";
import { createProduct, getAllProducts, getProductById, updateProduct } from "../app/controllers/product.controller";

const router = express.Router();

router.post("/products/add", createProduct);
router.get("/products", getAllProducts);
router.patch("/products/:id/update", updateProduct);
router.get("/products/:id/getById", getProductById);

export default router;
