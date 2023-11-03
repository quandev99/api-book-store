
import express from "express";

import { createPublisher, deletePublisher, forceDeletePublisher, getAllDeletePublisher, getAllPublishers, getPublisherById, restorePublisher, updatePublisher } from "../app/controllers/publisher.controller";

const router = express.Router();

router.post("/publishers/add", createPublisher);
router.patch("/publishers/:id/update", updatePublisher);
router.get("/publishers/:id/getById", getPublisherById);
router.delete("/publishers/:id/delete", deletePublisher);
router.patch("/publishers/:id/restore", restorePublisher);
router.delete("/publishers/:id/force", forceDeletePublisher);
router.get("/publishers", getAllPublishers);
router.get("/publishers/trash", getAllDeletePublisher);
export default router;
