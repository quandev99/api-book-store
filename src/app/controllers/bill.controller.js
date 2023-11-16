import userModel from "../models/user.model";
import productModel from "../models/product.model";
import cartModel from "../models/cart.model";
import billDetailModel from "../models/billDetail.model";
import billModel from "../models/bill.model";

export const addBill = async (req, res) => {

  const {
    user_id,
    bill_shipping_Address,
    bill_phoneNumber,
    bill_note,
    payment_method = "CashPayment",
  } = req.body;
  try {
    const user = await userModel.findOne({ _id: user_id });
    if (!user) {
      return res.status(400).json({ message: "Tài khoản không tồn tại!" });
    }
    const cart = await cartModel.findOne({ _id: user.cart_id });
    if (!cart) {
      return res.status(400).json({ message: "Giỏ hàng không tồn tại!" });
    }

    // Tạo hóa đơn (bill) từ thông tin trong cart
    const newBill = new billModel({
      user_id: cart?.user_id,
      bill_totalPrice: cart?.cart_totalPrice,
      bill_totalOrder: cart?.cart_totalOrder,
      bill_phoneNumber: user?.user_phone || bill_phoneNumber,
      bill_shipping_Address: bill_shipping_Address,
      bill_note,
      payment_method: payment_method,
    });

    // Lưu hóa đơn vào cơ sở dữ liệu
    const savedBill = await newBill.save();

    // Tạo danh sách chi tiết hóa đơn từ sản phẩm trong giỏ hàng
    const billDetails = await Promise.all(
      cart.products.map(async (item) => {
        const product = await productModel.findById(item.product_id);
        const image = product?.image[0]?.url;
        return new billDetailModel({
          bill_id: savedBill._id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.product_price * item.quantity,
          product_image: image,
          product_name: product.name,
        });
      })
    );
    // Lưu danh sách chi tiết hóa đơn vào cơ sở dữ liệu
    const savedBillDetails = await billDetailModel.insertMany(billDetails);

    // Lấy danh sách ID của các chi tiết hóa đơn đã được lưu
    const billDetailIds = savedBillDetails.map((billDetail) => billDetail._id);

    // Cập nhật trường bill_details trong hóa đơn (bill) với danh sách các ID chi tiết hóa đơn
    const updatedBill = await billModel.findByIdAndUpdate(
      savedBill._id,
      {
        $push: { bill_details: billDetailIds },
      },
      {
        new: true,
      }
    );
    // Xóa giỏ hàng sau khi đã tạo hóa đơn thành công (nếu cần)
    await cartModel.findOneAndDelete({ user_id });
    return res
      .status(200)
      .json({ message: "Hóa đơn đã được tạo thành công!", bill: updatedBill });
  } catch (error) {
    console.error("Lỗi khi tạo hóa đơn:", error);
    return res.status(500).json({ message: "Đã xảy ra lỗi khi tạo hóa đơn!" });
  }
};


export const getBillByUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await userModel.findById(id);
    if (!user)
      return res.status(500).json({ message: "Tài khoản không tồn tại!" });
    const bill = await billModel.findOne({ user_id: user?._id }).populate({
      path: "bill_details",
    });
    if (!bill)
      return res
        .status(300)
        .json({ message: "Danh sách giỏ hàng không tồn tại!", bill: [] });
    return res
      .status(200)
      .json({ message: "Danh sách giỏ hàng theo tài khoản!", bill });
  } catch (error) {
    return res.status(500).json({ message: "Error server: " + error.message });
  }
};

export const getAllBills = async (req, res) => {
  const {
    _page = 1,
    _limit = 10,
    _sort = "createdAt",
    _order = "asc",
    _expand,
  } = req.query;
  const option = {
    page: _page,
    limit: _limit,
    sort: {
      [_sort]: _order === "desc" ? -1 : 1,
    },
  };
  let query = {};
  if (_expand) {
    query._id = _expand || "";
  }
  try {
    const bills = await billModel.paginate(query, {
      ...option,
      populate: [{ path: "bill_details" }],
    });
    if (!bills.docs || bills.docs.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Danh sách bill trống!",
        bills: bills.docs,
        pagination: {
          currentPage: bills.page,
          totalPages: bills.totalPages,
          totalItems: bills.totalDocs,
        },
      });
    }
    res.status(200).json({
      success: true,
      message: "Danh sách tác giả !",
      bills: bills.docs,
      pagination: {
        currentPage: bills.page,
        totalPages: bills.totalPages,
        totalItems: bills.totalDocs,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Publisher error server: " + error.message,
    });
  }
};