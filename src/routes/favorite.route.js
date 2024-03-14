import express from "express";
import { addFavoriteProduct, getFavoriteProductsByUserId } from "../app/controllers/favorite.controller";
import { verifyToken, verifyTokenAndAdminAuth } from "../app/middlewares/auth.middleware";

const router = express.Router();

router.use(verifyToken);
router.get("/favorites/:userId", getFavoriteProductsByUserId);
router.post("/favorites/addFavoriteProduct", addFavoriteProduct);

export default router;
