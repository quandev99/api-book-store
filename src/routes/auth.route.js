import express from "express";
import { register } from "../app/controllers/auth.controller";
const router = express.Router();
router.post("/signup", register);

export default router;
