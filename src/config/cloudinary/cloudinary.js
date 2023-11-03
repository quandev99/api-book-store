import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();
cloudinary.config({
  cloud_name: "dboibmxrw",
  api_key: "598829282998138",
  api_secret: "BaZGchY614UlX-Qfg69tKnmEiRE",
  secure: true,
});

export default cloudinary;
