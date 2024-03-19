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
import {
  verifyTokenAndAdminAuth,
  verifyTokenMember,
} from "../app/middlewares/auth.middleware";
const router = express.Router();

router.get("/category", getAllCategories);
router.post("/category/add", verifyTokenMember, createCategory);
router.get("/category/:id/categoryById", getCategoryById);
router.patch("/category/:id/update", verifyTokenMember, updateCategory);
router.delete("/category/:id/delete", verifyTokenAndAdminAuth, deleteCategory);
router.patch("/category/:id/restore", verifyTokenAndAdminAuth, restoreCategory);
router.delete(
  "/category/:id/force",
  verifyTokenAndAdminAuth,
  forceDeleteCategory
);
router.get("/category/trash", getAllDeletedCategories);
export default router;
