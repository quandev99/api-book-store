import express from "express";

import {
  verifyToken,
  verifyTokenMember,
} from "../app/middlewares/auth.middleware";
import { addReview } from "../app/controllers/review.controller";

const router = express.Router();

router.use(verifyToken);

router.post("/reviews/add", verifyTokenMember, addReview);

export default router;
