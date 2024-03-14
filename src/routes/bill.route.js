
import express from "express";
import { addBill, cancelBill, getAllBills, getBillById, getBillByUser, updateBillStatus } from "../app/controllers/bill.controller";
import { verifyToken, verifyTokenAndAdminAuth, verifyTokenMember } from "../app/middlewares/auth.middleware";

const router = express.Router();

router.use(verifyToken);
router.get("/bills", verifyTokenMember, getAllBills);
router.post("/bills/add", verifyTokenMember, addBill);
router.get(
  "/bills/getBillByUser",
  getBillByUser
);
router.get("/bills/getBillById/:orderId", verifyTokenMember, getBillById);
router.patch("/bills/cancelBill/:id", verifyTokenMember, cancelBill);
router.patch(
  "/bills/updateBillStatus/:id",
  verifyTokenMember,
  updateBillStatus
);

export default router;