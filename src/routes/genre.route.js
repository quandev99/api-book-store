import express from "express";
import { createGenre, deleteGenre, forceDeleteGenre, getAllDeleteGenres, getAllGenres, getGenreById, restoreGenre, updateGenre } from "../app/controllers/genre.controller";


const router = express.Router();
router.post("/genres/add", createGenre);
router.patch("/genres/:id/update", updateGenre);
router.get("/genres/:id/getById", getGenreById);
router.delete("/genres/:id/delete", deleteGenre);
router.patch("/genres/:id/restore", restoreGenre);
router.delete("/genres/:id/force", forceDeleteGenre);
router.get("/genres", getAllGenres);
router.get("/genres/trash", getAllDeleteGenres);
export default router;
