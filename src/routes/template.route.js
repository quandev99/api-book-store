import express from "express";
import { createTemplate } from "../app/controllers/template.controller";

const router = express.Router();

router.post("/templates/create", createTemplate);

export default router;
