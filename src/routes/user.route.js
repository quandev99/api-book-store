import express from "express";
import { deleteUser, forceDeleteUser, getAllDeleteUser, getAllUsers, getUserById, restoreUser, updateUser } from "../app/controllers/user.controler";
import {verifyTokenAndAdminAuth,verifyTokenMember,} from "../app/middlewares/auth.middleware";
const router = express.Router();

router.get("/users", verifyTokenMember, getAllUsers);
router.get("/users/:id/getById", verifyTokenAndAdminAuth, getUserById);
router.patch("/users/:id/update", verifyTokenAndAdminAuth, updateUser);
router.delete("/users/:id/delete", verifyTokenAndAdminAuth, deleteUser);
router.patch("/users/:id/restore", verifyTokenAndAdminAuth, restoreUser);
router.delete("/users/:id/force", verifyTokenAndAdminAuth, forceDeleteUser);
router.get("/users/trash", verifyTokenAndAdminAuth, getAllDeleteUser);
export default router;
