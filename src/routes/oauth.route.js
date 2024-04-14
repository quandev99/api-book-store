import express from "express";
import passport from "passport";
import dotenv from "dotenv";
import { LoginWithGoogle, LogoutGoogle } from "../app/controllers/oauth.controller";
dotenv.config();
const router = express.Router();
router.get(
  "/oauth/google",
  passport.authenticate("google", {
    scope: ["email", "profile"],
  })
);
router.get(
  "/oauth/google/callback",
  passport.authenticate("google", {
    successRedirect: `${process.env.UR_ADMIN}/google/success`,
    failureRedirect: `${process.env.UR_CLIENT}/sign-in`,
  })
);
router.use("/oauth/logout", LogoutGoogle);
router.use("/google/success", LoginWithGoogle);


export default router