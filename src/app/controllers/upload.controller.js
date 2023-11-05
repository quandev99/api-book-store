import cloudinary from "../../config/cloudinary/cloudinary";

// Xử lý việc tải lên tệp
export const uploadImage = async (req, res) => {
  try {
    // Kiểm tra xem đã tải lên tệp chưa
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Sử dụng Cloudinary API để tải lên tệp
    const result = await cloudinary.uploader.upload(req.file.path);
    const { public_id, secure_url } = result;
    // Trả về cả public_id và secure_url
   return  res.json({ publicId: public_id, url: secure_url });
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
    return res.json({ urls: uploadedFiles });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteImage = async (req, res) => {
  const publicId = req.params.publicId;
  try {
    const result = await cloudinary.uploader.destroy(publicId);
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
    const [uploadResult, deleteResult] = await Promise.all([
      cloudinary.uploader.upload(newImage),
      cloudinary.uploader.destroy(publicId),
    ]);
    // Trả về kết quả với url và publicId của ảnh mới
    return res.json({
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: error.message || "Error updating image" });
  }
};
