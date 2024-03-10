import express from "express";
const router = express.Router();
import { uploadImageCloudinary } from "../app/middlewares/upload.middleware";
import {
  deleteImage,
  updateImage,
  uploadImage,
  uploadImages,
} from "../app/controllers/upload.controller";
import {
  verifyToken,
  verifyTokenMember,
} from "../app/middlewares/auth.middleware";
router.post(
  "/images/upload",
  verifyToken,
  uploadImageCloudinary.single("image"),
  uploadImage
);
// router.post(
//   "/images/uploads",
//   verifyTokenMember,
//   uploadImageCloudinary.array("images", 10),
//   uploadImages
// );
router.delete("/images/:publicId/delete", verifyTokenMember, deleteImage);
router.put(
  "/images/:publicId",
  verifyTokenMember,
  uploadImageCloudinary.array("images", 10),
  updateImage
);

export default router;
