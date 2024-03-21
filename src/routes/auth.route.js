import express from "express";
import { checkAuthRegister, handlerRefreshToken, login, logout, register, verifyUser } from "../app/controllers/auth.controller";
import { authentication } from "../app/auth/authUtils";
import asyncHandler from "../helpers/asyncHandler";
const router = express.Router();

router.get("/auths/verifyUser", verifyUser);
router.post("/auths/checkAuthRegister", checkAuthRegister);
router.post("/auths/sign-in", login);
router.post("/auths/sign-up", register);

// router.use(authentication);
router.post("/auths/logout", logout);
router.post("/auths/refreshToken", handlerRefreshToken);

export default router;
