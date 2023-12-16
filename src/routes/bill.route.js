
import express from "express";
import { addBill, getAllBills, getBillByUser } from "../app/controllers/bill.controller";
import { verifyToken, verifyTokenAndAdminAuth } from "../app/middlewares/auth.middleware";

const router = express.Router();

router.post("/bills/add",verifyToken, addBill);
router.get("/bills/getById/:id",verifyToken, getBillByUser);
router.get("/bills",  verifyTokenAndAdminAuth, getAllBills);

export default router;