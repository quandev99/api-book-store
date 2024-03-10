import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../../config/cloudinary";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "book-store",
    format: "jpg",
    allowedFormats: ["jpg", "jpeg", "png", "gif"],
  },
});

export const uploadImageCloudinary = multer({ storage });
