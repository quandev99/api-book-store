import express from "express";
import { createProduct, getAllProducts, getProductByCategoryId, getProductById, updateProduct } from "../app/controllers/product.controller";
import { verifyTokenMember } from "../app/middlewares/auth.middleware";

const router = express.Router();

router.get("/products", getAllProducts);
router.patch("/products/:id/update", verifyTokenMember, updateProduct);
router.get("/products/:id/getById", getProductById);
router.get("/products/:categoryId/getByCate", getProductByCategoryId);
router.post("/products/add", verifyTokenMember, createProduct);

export default router;
