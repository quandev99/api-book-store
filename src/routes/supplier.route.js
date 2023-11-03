import express from "express";
import {
  createSupplier,
  deleteSupplier,
  forceDeleteSupplier,
  getAllDeleteSupplier,
  getAllSuppliers,
  getSupplierById,
  restoreSupplier,
  updateSupplier,
} from "../app/controllers/supplier.controller";


const router = express.Router();
router.post("/suppliers/add", createSupplier);
router.patch("/suppliers/:id/update", updateSupplier);
router.get("/suppliers/:id/getById", getSupplierById);
router.delete("/suppliers/:id/delete", deleteSupplier);
router.patch("/suppliers/:id/restore", restoreSupplier);
router.delete("/suppliers/:id/force", forceDeleteSupplier);
router.get("/suppliers", getAllSuppliers);
router.get("/suppliers/trash", getAllDeleteSupplier);
export default router;
