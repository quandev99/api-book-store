import express from "express";
import { getAllProducts, getProductByCategoryId, getProductById } from "../app/controllers/product.controller";
import { getAllCategories } from "../app/controllers/category.controller";
import { getAllAuthors } from "../app/controllers/author.controller";
import { getAllGenres } from "../app/controllers/genre.controller";
import { getAllPublishers } from "../app/controllers/publisher.controller";
import { getAllSuppliers } from "../app/controllers/supplier.controller";
import { getReviewProductId } from "../app/controllers/review.controller";



const router = express.Router();

router.get("/clients/product", getAllProducts);
router.get("/clients/product/:id", getProductById);
router.get("/clients/product/:categoryId/getByCate", getProductByCategoryId);
router.get("/clients/reviews/:productId/",getReviewProductId);
router.get("/clients/categories", getAllCategories);
router.get("/clients/authors", getAllAuthors);
router.get("/clients/genres", getAllGenres);
router.get("/clients/publishers", getAllPublishers);
router.get("/clients/suppliers", getAllSuppliers);

export default router;
