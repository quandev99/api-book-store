import express from "express";
import { handlerRefreshToken, login, logout, register } from "../app/controllers/auth.controller";
import { authentication } from "../app/auth/authUtils";
import asyncHandler from "../helpers/asyncHandler";
const router = express.Router();

router.post("/auths/signup", register);
router.post("/auths/signin", login);

router.use(authentication);
router.post("/auths/logout", logout);
router.post("/auths/refreshToken", handlerRefreshToken);

export default router;
