import userModel from "../models/user.model";
import productModel from "../models/product.model";
import cartModel from "../models/cart.model";
import billDetailModel from "../models/billDetail.model";
import billModel from "../models/bill.model";
import { generateRandomCode } from "../../until/cryptoUtil";

const dataBillStatus =[
        "Pending",
        "Processing",
        "Confirmed",
        "Delivering",
        "Delivered",
        "Abort",
        "Completed",
      ]
export const addBill = async (req, res) => {
  try {
      const {
        user_id,
        bill_userName,
        bill_shippingAddress,
        bill_phoneNumber,
        bill_note,
        payment_method = "CashPayment",
      } = req.body;
    const user = await userModel.findById({ _id: user_id });
    if (!user) {
      return res.status(400).json({ message: "Tài khoản không tồn tại!" });
    }
    const cart = await cartModel.findOne({ _id: user.cart_id });
    if (!cart) {
      return res.status(400).json({ message: "Giỏ hàng không tồn tại!" });
    }
    const cartResult = await cart?.products?.filter(
      (item) => item.is_checked === true
    );
    // Tạo hóa đơn (bill) từ thông tin trong cart
    const newBill = new billModel({
      user_id: cart?.user_id,
      bill_code: generateRandomCode(),
      bill_totals: cart?.totals,
      bill_totalOrder: cart?.products?.length || 0,
      bill_user_name: bill_userName,
      bill_phoneNumber: bill_phoneNumber,
      bill_shipping_Address: bill_shippingAddress,
      bill_note,
      payment_method,
    });

    // Lưu hóa đơn vào cơ sở dữ liệu
    const savedBill = await newBill.save();
    const billDetails = await Promise.all(
      cartResult.map(async (item) => {
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
  const {id:_id} = req.params;
  try {
    const bill = await billModel.findById(_id).populate({
      path: "bill_details"
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
    _bill_status="", 
  } = req.query;
  if (
    !_bill_status === "" ||
    (_bill_status && !dataBillStatus.includes(_bill_status))
  ) {
    return res.status(400).json({
      success: false,
      message: "Trạng thái hóa đơn không hợp lệ",
    });
  }

  const option = {
    page: _page,
    limit: _limit,
    sort: {
      [_sort]: _order === "desc" ? -1 : 1,
    },
  };
  let query = {};

  // Thêm điều kiện trạng thái hóa đơn vào truy vấn
  if (_bill_status) {
    query.bill_status = _bill_status;
  }

  if (_expand) {
    query._id = _expand || "";
  }

  try {
    const bills = await billModel.paginate(query, {
      ...option,
      populate: [{ path: "bill_details" }],
    });
    if (!bills.docs || bills.docs.length === 0) {
      return res.status(200).json({
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
    return res.status(200).json({
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

export const updateBillStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { newStatus } = req.body;
    console.log("req.body", req.body);
    // Kiểm tra trạng thái hóa đơn mới
    const validStatuses = ["Pending", "Confirmed", "Delivering", "Delivered", "Abort", "Completed"];
    if (!validStatuses.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái hóa đơn mới không hợp lệ",
      });
    }

    // Kiểm tra trạng thái hiện tại của hóa đơn
    const currentBill = await billModel.findById(id);
    if (!currentBill) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy hóa đơn",
      });
    }
     const dataUser = req?.user;
     const auth = JSON.parse(dataUser);
    if (
      currentBill?.bill_status === "Confirmed" &&
      newStatus === "Abort" &&
      auth?.role == 2
    ) {
      return res.status(400).json({
        success: false,
        message: "Không thể hủy bỏ hóa đơn đã xác nhận",
      });
    }
    // Cập nhật trạng thái hóa đơn
    const updatedBill = await billModel.findByIdAndUpdate(
      id,
      { bill_status: newStatus },
      { new: true } // Trả về hóa đơn sau khi đã cập nhật
    );

    return res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái hóa đơn thành công",
      bill: updatedBill,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật trạng thái hóa đơn: " + error.message,
    });
  }
};
