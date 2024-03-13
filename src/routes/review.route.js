import express from "express";

import {
  verifyToken,
  verifyTokenMember,
} from "../app/middlewares/auth.middleware";
import { addReview, getAllReviews, getReviewProductId, hiddenReview } from "../app/controllers/review.controller";

const router = express.Router();

router.use(verifyToken);

router.post("/reviews/add", verifyTokenMember, addReview);
router.get("/reviews/:productId/", verifyTokenMember, getReviewProductId);
router.get("/reviews", verifyTokenMember, getAllReviews);
router.patch("/reviews/:reviewId", verifyTokenMember, hiddenReview);

export default router;
