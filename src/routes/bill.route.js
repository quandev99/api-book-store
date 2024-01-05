
import express from "express";
import { addBill, getAllBills, getBillByUser, updateBillStatus } from "../app/controllers/bill.controller";
import { verifyToken, verifyTokenAndAdminAuth } from "../app/middlewares/auth.middleware";

const router = express.Router();

router.post("/bills/add",verifyToken, addBill);
router.get("/bills/getById/:id",verifyToken, getBillByUser);
router.patch("/bills/updateBillStatus/:id", verifyToken, updateBillStatus);
router.get("/bills",  verifyTokenAndAdminAuth, getAllBills);

export default router;