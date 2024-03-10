import cloudinary from "../../config/cloudinary";

// Xử lý việc tải lên tệp
export const uploadImage = async (req, res) => {
  const file = req.file;
  try {
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    // Sử dụng Cloudinary API để tải lên tệp
    const result = await cloudinary.uploader.upload(file.path, 
      {
      folder: "book-store",
      public_id: file.originalname.split(".")[0],
      overwrite: true,
      quality: "auto:low",
    }
    );
    const { original_filename, secure_url } = result;
    return res
      .status(201)
      .json({ publicId: original_filename, url: secure_url });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error updating image: " + error.message });
  }
};

export const uploadImages = async (req, res) => {
  const files = req.files;
  if (!Array.isArray(files)) {
    return res.status(400).json({ error: "No files were uploaded" });
  }
  try {
    const uploadPromises = files.map((file) => {
      // Sử dụng Cloudinary API để upload file lên Cloudinary
      return cloudinary.uploader.upload(file.path);
    });

    // Chờ cho tất cả các file đều được upload lên Cloudinary
    const results = await Promise.all(uploadPromises);
    // Trả về kết quả là một mảng các đối tượng chứa thông tin của các file đã upload lên Cloudinary
    const uploadedFiles = results.map((result) => ({
      url: result.secure_url,
      publicId: result.public_id,
    }));
    return res.status(201).json({ urls: uploadedFiles });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteImage = async (req, res) => {
  const publicId = req.params.publicId;
  try {
    const result = await cloudinary.uploader.destroy(`book-store/${publicId}`, {
      invalidate: true,
    });
    // Check if the image was successfully deleted
    if (result.result === "ok") {
      return res.status(200).json({ message: "Xóa ảnh thành công", result });
    } else {
      return res.status(500).json({ error: "Error deleting image" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message || "Error deleting image" });
  }
};

export const updateImage = async (req, res) => {
  const files = req.files;
  if (!Array.isArray(files)) {
    return res.status(400).json({ error: "No files were uploaded" });
  }

  const publicId = req.params.publicId; // Lấy publicId của ảnh cần cập nhật
  const newImage = req.files[0].path; // Lấy đường dẫn của ảnh mới
  try {
    // Upload ảnh mới lên Cloudinary và xóa ảnh cũ cùng lúc
    const [uploadResult] = await Promise.all([
      cloudinary.uploader.upload(newImage, {
        folder: "book-store",
        public_id: req.files[0].originalname.split(".")[0],
        overwrite: true,
        quality: "auto:low",
      }),
      cloudinary.uploader.destroy(`book-store/${publicId}`),
    ]);
    // Trả về kết quả với url và publicId của ảnh mới
    return res.json({
      url: uploadResult.secure_url,
      publicId: uploadResult.original_filename,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: error.message || "Error updating image" });
  }
};
