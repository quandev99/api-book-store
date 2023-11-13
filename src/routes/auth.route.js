import express from "express";
import { handlerRefreshToken, login, logout, register } from "../app/controllers/auth.controller";
import { authentication } from "../app/auth/authUtils";
import asyncHandler from "../helpers/asyncHandler";
const router = express.Router();

router.post("/signup", register);
router.post("/signin", login);

router.use(authentication);
router.post("/logout", logout);
router.post("/refreshToken", handlerRefreshToken);

export default router;
