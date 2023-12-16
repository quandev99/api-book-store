import express from "express";
import { createAuthor, deleteAuthor, forceDeleteAuthor, getAllAuthors, getAllDeleteAuthor, getAuthorById, restoreAuthor, updateAuthor } from "../app/controllers/author.controller";
import {
  verifyTokenAndAdminAuth,
  verifyTokenMember,
} from "../app/middlewares/auth.middleware";
const router = express.Router();
router.post("/authors/add", verifyTokenMember, createAuthor);
router.patch("/authors/:id/update", verifyTokenMember, updateAuthor);
router.get("/authors/:id/getById", getAuthorById);
router.delete("/authors/:id/delete", verifyTokenAndAdminAuth, deleteAuthor);
router.patch("/authors/:id/restore", verifyTokenAndAdminAuth, restoreAuthor);
router.delete("/authors/:id/force", verifyTokenAndAdminAuth, forceDeleteAuthor);
router.get("/authors", getAllAuthors);
router.get("/authors/trash", verifyTokenAndAdminAuth, getAllDeleteAuthor);
export default router;
