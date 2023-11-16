import express from "express";
import { deleteUser, forceDeleteUser, getAllDeleteUser, getAllUsers, getUserById, restoreUser, updateUser } from "../app/controllers/user.controler";

const router = express.Router();

router.get("/users", getAllUsers);
router.get("/users/:id/getById", getUserById);
router.patch("/users/:id/update", updateUser);
router.delete("/users/:id/delete", deleteUser);
router.patch("/users/:id/restore", restoreUser);
router.delete("/users/:id/force", forceDeleteUser);
router.get("/users/trash", getAllDeleteUser);
export default router;
