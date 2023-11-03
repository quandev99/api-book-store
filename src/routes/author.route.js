import express from "express";
import { createAuthor, deleteAuthor, forceDeleteAuthor, getAllAuthors, getAllDeleteAuthor, getAuthorById, restoreAuthor, updateAuthor } from "../app/controllers/author.controller";

const router = express.Router();
router.post("/authors/add", createAuthor);
router.patch("/authors/:id/update", updateAuthor);
router.get("/authors/:id/getById", getAuthorById);
router.delete("/authors/:id/delete", deleteAuthor);
router.patch("/authors/:id/restore", restoreAuthor);
router.delete("/authors/:id/force", forceDeleteAuthor);
router.get("/authors", getAllAuthors);
router.get("/authors/trash", getAllDeleteAuthor);
export default router;
