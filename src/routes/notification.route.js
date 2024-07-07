import express from "express";

import { getAllNotifications, getNotificationByUser, updateSeenStatus } from "../app/controllers/notification.controller";
import { verifyToken } from "../app/middlewares/auth.middleware";

const router = express.Router();
router.use(verifyToken);
router.get("/notifications", getAllNotifications);
router.get("/notifications/getNotificationByUser", getNotificationByUser);
router.patch("/notifications/:id/seenByUser", updateSeenStatus);

export default router;
