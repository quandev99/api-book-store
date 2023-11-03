import express from "express";
import {
  createCategory,
  deleteCategory,
  forceDeleteCategory,
  getAllCategories,
  getAllDeletedCategories,
  getCategoryById,
  restoreCategory,
  updateCategory,
} from "../app/controllers/category.controller";

const router = express.Router();

router.post("/category/add", createCategory);
router.get("/category", getAllCategories);
router.get("/category/:id/categoryById", getCategoryById);
router.patch("/category/:id/update", updateCategory);
router.delete("/category/:id/delete", deleteCategory);
router.patch("/category/:id/restore", restoreCategory);
router.delete("/category/:id/force", forceDeleteCategory);
router.get("/category/trash", getAllDeletedCategories);
export default router;
