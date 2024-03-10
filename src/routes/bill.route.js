
import express from "express";
import { addBill, getAllBills, getBillById, getBillByUser, updateBillStatus } from "../app/controllers/bill.controller";
import { verifyToken, verifyTokenAndAdminAuth, verifyTokenMember } from "../app/middlewares/auth.middleware";

const router = express.Router();

router.use(verifyToken);
router.get("/bills", verifyTokenMember, getAllBills);
router.post("/bills/add", verifyTokenMember, addBill);
router.get(
  "/bills/getBillByUser",
  verifyToken,
  getBillByUser
);
router.get("/bills/getBillById/:orderId", verifyTokenMember, getBillById);
router.patch(
  "/bills/updateBillStatus/:id",
  verifyTokenMember,
  updateBillStatus
);

export default router;