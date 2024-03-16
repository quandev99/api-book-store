import express from "express";
import moment from "moment";
import crypto from "crypto";
import qs from "qs";
import billModel from "../app/models/bill.model";
import cartModel from "../app/models/cart.model";
import userModel from "../app/models/user.model";
import { generateRandomCode } from "../until/cryptoUtil";
import billDetailModel from "../app/models/billDetail.model";
import productModel from "../app/models/product.model";
import { verifyToken, verifyTokenMember } from "../app/middlewares/auth.middleware";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { sortObject } from "../until/sortObjectPayment";
import sendMail from "../until/sendMail";
dotenv.config();


const router = express.Router();
router.get("/payments/vnpay_return", async function (req, res, next) {
  let { userId, ...vnp_Params } = req.query;
  const orderId = vnp_Params["vnp_TxnRef"];
  console.log("vnpay_return ::::2", "đã qua cái này");
  let secureHash = vnp_Params["vnp_SecureHash"];

  delete vnp_Params["vnp_SecureHash"];
  delete vnp_Params["vnp_SecureHashType"];

  vnp_Params = sortObject(vnp_Params);

  let secretKey = "BCOLWYSKNIWURZRHHJKMQXVRMDYCGDCA";
  let rspCode = vnp_Params["vnp_ResponseCode"];

  let signData = qs.stringify(vnp_Params, { encode: false });
  let hmac = crypto.createHmac("sha512", secretKey);
  let signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");
  if (secureHash === signed) {
    if (rspCode == "00") {
      await billModel.findOneAndUpdate(
        { _id: orderId },
        { $set: { status: true, bill_status: "Confirmed" } }
      );
      // Xóa giỏ hàng sau khi đã tạo hóa đơn thành công (nếu cần)
      await cartModel.findOneAndDelete({ user_id: userId });
      const user = await userModel.findOne({ _id: userId });
      if (!user) {
        return res.status(400).json({ message: "Tài khoản không tồn tại!" });
      }
      const html= `<p style="font-size: 16px; color: #002140; font-weight: 600;">Mong khách hàng chú ý đơn hàng để có thể giao đúng hẹn</p>`;
      const subject= "Cảm ơn bạn đã mua hàng bên Book Store";
      sendMail({ email: user?.email, subject, html });
      res.redirect(`${process.env.UR_CLIENT}/customer/order/${orderId}/update`);
    } else {
      res.redirect(`${process.env.UR_CLIENT}/checkout`);
    }
  } else {
    res.status(200).json({ RspCode: "97", Message: "Checksum failed" });
  }
});
router.use(verifyToken);
router.post(
  "/payments/create_payment_url",
  verifyTokenMember,
  async (req, res) => {
    const {
      user_id,
      bill_userName,
      bill_shippingAddress,
      bill_phoneNumber,
      bill_note,
      payment_method = "OnlinePayment",
    } = req.body;
    const user = await userModel.findOne({ _id: user_id });
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
    
    const priceBill = updatedBill?.bill_totals?.find(
      (item) => item?.code === "grand_total"
    )?.price;

    process.env.TZ = "Asia/Ho_Chi_Minh";

    let date = new Date();
    let createDate = moment(date).format("YYYYMMDDHHmmss");

    let ipAddr =
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;

    let tmnCode = "18WH6AY8";
    let secretKey = "BCOLWYSKNIWURZRHHJKMQXVRMDYCGDCA";
    let vnpUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    let returnUrl =
      "http://localhost:2605/api/payments/vnpay_return" + `?userId=${user_id}`;
    const amount = +priceBill;
    const orderId = savedBill?._id.toHexString();
    let locale = req.body.language || "vn";
    if (locale === null || locale === "") {
      locale = "vn";
    }
    let currCode = "VND";
    let vnp_Params = {};
    vnp_Params["vnp_Version"] = "2.1.0";
    vnp_Params["vnp_Command"] = "pay";
    vnp_Params["vnp_TmnCode"] = tmnCode;
    vnp_Params["vnp_Locale"] = locale;
    vnp_Params["vnp_CurrCode"] = currCode;
    vnp_Params["vnp_TxnRef"] = orderId;
    vnp_Params["vnp_OrderInfo"] = "Thanh toan cho ma GD:" + orderId;
    vnp_Params["vnp_OrderType"] = "other";
    vnp_Params["vnp_Amount"] = amount * 100;
    vnp_Params["vnp_ReturnUrl"] = returnUrl;
    vnp_Params["vnp_IpAddr"] = ipAddr;
    vnp_Params["vnp_CreateDate"] = createDate;
    vnp_Params["vnp_BankCode"] = "VNPAY";

    vnp_Params = sortObject(vnp_Params);
    let signData = qs.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");
    vnp_Params["vnp_SecureHash"] = signed;
    vnpUrl += "?" + qs.stringify(vnp_Params, { encode: false });

    res.json(vnpUrl);
  }
);


export default router