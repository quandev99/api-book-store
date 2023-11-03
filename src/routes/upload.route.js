import express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import {
  deleteImage,
  updateImage,
  uploadImage,
  uploadImages,
} from "../app/controllers/upload.controller";
import cloudinary from "../config/cloudinary/cloudinary";
const router = express.Router();

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "book-store",
    format: "jpg",
    allowedFormats: ["jpg", "jpeg", "png", "gif"],
  },
});

const upload = multer({ storage: storage });

router.post("/images/uploads/single", upload.single("images"), uploadImage);
router.post("/images/uploads", upload.array("images", 10), uploadImages);
router.delete("/images/:publicId/delete", deleteImage);
router.put("/images/:publicId", upload.array("images", 10), updateImage);

export default router;
