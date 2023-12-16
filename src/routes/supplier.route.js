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
import {
  verifyTokenAndAdminAuth,
  verifyTokenMember,
} from "../app/middlewares/auth.middleware";

const router = express.Router();
router.post("/suppliers/add",verifyTokenMember, createSupplier);
router.patch("/suppliers/:id/update",verifyTokenMember, updateSupplier);
router.get("/suppliers/:id/getById", getSupplierById);
router.delete("/suppliers/:id/delete", verifyTokenAndAdminAuth, deleteSupplier);
router.patch(
  "/suppliers/:id/restore",
  verifyTokenAndAdminAuth,
  restoreSupplier
);
router.delete(
  "/suppliers/:id/force",
  verifyTokenAndAdminAuth,
  forceDeleteSupplier
);
router.get("/suppliers", getAllSuppliers);
router.get("/suppliers/trash", verifyTokenAndAdminAuth, getAllDeleteSupplier);
export default router;
