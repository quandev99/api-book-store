
import express from "express";
import { verifyToken, verifyTokenAndAdminAuth, verifyTokenMember } from "../app/middlewares/auth.middleware";
import { createDiscounts } from "../app/controllers/discount.controller";

const router = express.Router();

// router.use(verifyToken);
router.post("/discounts/create", createDiscounts);


export default router;