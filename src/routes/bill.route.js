
import express from "express";
import { addBill, getAllBills, getBillByUser } from "../app/controllers/bill.controller";


const router = express.Router();

router.post("/bills/add", addBill);
router.get("/bills/getById/:id", getBillByUser);
router.get("/bills", getAllBills);

export default router;