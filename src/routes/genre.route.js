import express from "express";
import { createGenre, deleteGenre, forceDeleteGenre, getAllDeleteGenres, getAllGenres, getGenreById, restoreGenre, updateGenre } from "../app/controllers/genre.controller";
import {
  verifyTokenAndAdminAuth,
  verifyTokenMember,
} from "../app/middlewares/auth.middleware";

const router = express.Router();
router.post("/genres/add", verifyTokenMember, createGenre);
router.patch("/genres/:id/update", verifyTokenMember, updateGenre);
router.get("/genres/:id/getById", getGenreById);
router.delete("/genres/:id/delete", verifyTokenAndAdminAuth, deleteGenre);
router.patch("/genres/:id/restore", verifyTokenAndAdminAuth, restoreGenre);
router.delete("/genres/:id/force", verifyTokenAndAdminAuth, forceDeleteGenre);
router.get("/genres", getAllGenres);
router.get("/genres/trash", verifyTokenAndAdminAuth, getAllDeleteGenres);
export default router;
