import discountModel from "../models/discount.model";

export const createDiscounts = async (req, res) => {
  const dataDiscount = req.body;
  const { discount_name, discount_code, users } = req.body;
  const expiration_date = new Date(Date.now() *24)
  try {

    const checkName = await discountModel.findOne({ discount_name });
    if (checkName) {
      return res.status(400).json({
        message: "tên khuyễn mãi đã tồn tại !",
      });
    }

    if (new Date(expiration_date) < new Date()) {
      return res.status(400).json({
        message: "Thời gian hết hạn phải lớn hơn thời gian hiện tại !",
      });
    }

    const checkCode = await discountModel.findOne({ discount_code });
    if (checkCode) {
      return res.status(400).json({
        message: "tên mã code giảm giá đã tồn tại !",
      });
    }
    const discount = await discountModel.create({...dataDiscount});
    if (!discount) {
      return res.status(404).json({
        error: "Tạo phiếu giảm giá thất bại",
      });
    }

    return res.status(200).json({
      message: "Tạo phiếu giảm giá thành công",
      discount,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};