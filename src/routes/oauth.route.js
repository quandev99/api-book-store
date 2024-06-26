import express from "express";
import passport from "passport";
import dotenv from "dotenv";
import { LoginWithFacebook, LoginWithGoogle, LogoutGoogle } from "../app/controllers/oauth.controller";
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
router.get(
  "/oauth/facebook",
  passport.authenticate("facebook", { scope: ["email", "public_profile"] })
);
router.get(
  "/oauth/facebook/callback",
  passport.authenticate("facebook", {
    successRedirect: `${process.env.UR_ADMIN}/facebook/success`,
    failureRedirect: `${process.env.UR_CLIENT}/sign-in`,
  })
);
router.use("/facebook/success", LoginWithFacebook);


export default router