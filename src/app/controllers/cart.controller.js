import userModel from "../models/user.model";
import productModel from "../models/product.model";
import cartModel from "../models/cart.model";

export const addToCart = async (req, res) => {
  const { userId, productId, quantity = 1 } = req.body;

  try {
    const user = await userModel.findById(userId);
    const product = await productModel.findById(productId);
     if (!user || !product) {
      return res.status(404).json({ message: "Tài khoản hoặc sản phẩm không tồn tại!" });
    }
    const {_id:user_id} = user
    let cart = await cartModel.findOne({user_id});
    if (!cart) {
      cart = new cartModel({
        user_id,
        products: [],
        cart_totalPrice: 0,
        cart_totalOrder: 0,
      });
      await userModel.findByIdAndUpdate(userId, { cart_id: cart._id });
    }
    const existingItem = cart?.products?.find((item) =>
      item?.product_id.equals(productId)
    );
    if (quantity > product?.quantity)
      return res
        .status(402)
        .json({ message: "Sản phẩm đặt hàng vượt quá số lượng kho" });
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart?.products.push({
        product_id: productId,
        product_price: product.price,
        quantity,
      });
    }

    cart.cart_totalPrice +=
      (product.price) *
      quantity;
    cart.cart_totalOrder += quantity;


    await cart.save();
    return res
      .status(200)
      .json({ message: "Sản phẩm đã được thêm vào giỏ hàng!", cart });
  } catch (error) {
    return res.status(500).json({ message: "Error server: " + error.message });
  }
};
export const updateCartItem = async (req, res) => {
  const { userId, productId, quantity } = req.body;
  try {
      const user = await userModel.findById(userId);
      const product = await productModel.findById(productId);
      if (!user || !product) {
        return res
          .status(404)
          .json({ message: "Tài khoản hoặc sản phẩm không tồn tại!" });
      }
      const { _id: user_id } = user;
    const cart = await cartModel.findOne({ user_id });

    if (!cart) {
      return res.status(404).json({ message: "Giỏ hàng không tồn tại" });
    }
    const existingItem = cart.products.find((item) =>
      item.product_id.equals(productId)
    );
    if (!existingItem) {
      return res
        .status(404)
        .json({ message: "Sản phẩm không tồn tại trong giỏ hàng" });
    }
    if (quantity > product?.quantity)
      return res
        .status(402)
        .json({ message: "Sản phẩm đặt hàng vượt quá số lượng kho" });

    existingItem.quantity = +quantity;
    // Cập nhật tổng giá và tổng số lượng trong giỏ hàng
    cart.cart_totalPrice = cart.products.reduce(
      (total, item) => total + item.product_price * item.quantity,
      0
    );
    cart.cart_totalOrder = cart.products.reduce(
      (total, item) => total + item.quantity,
      0
    );

    // Lưu giỏ hàng đã được cập nhật
    await cart.save();
    return res
      .status(200)
      .json({ message: "Sản phẩm trong giỏ hàng đã được cập nhật", cart });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server: " + error.message });
  }
};

export const removeCartItem = async (req, res) => {
  const { userId, productId } = req.body;
  try {
    const cart = await cartModel.findOne({ user_id: userId });
    if (!cart) {
      return res.status(404).json({ message: "Giỏ hàng không tồn tại" });
    }

    const existingItemIndex = cart.products.findIndex((item) =>
      item.product_id.equals(productId)
    );

    if (existingItemIndex === -1) {
      return res
        .status(404)
        .json({ message: "Sản phẩm không tồn tại trong giỏ hàng" });
    }

    // Lọc ra những sản phẩm không có productId
    cart.products.splice(existingItemIndex, 1);

    // Cập nhật tổng giá và tổng số lượng trong giỏ hàng
    cart.cart_totalPrice = cart.products.reduce(
      (total, item) => total + item.product_price * item.quantity,
      0
    );
    cart.cart_totalOrder = cart.products.reduce(
      (total, item) => total + item.quantity,
      0
    );

    // Lưu giỏ hàng đã được cập nhật
    await cart.save();

    return res
      .status(200)
      .json({ message: "Sản phẩm đã được xóa khỏi giỏ hàng", cart });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server: " + error.message });
  }
};

export const deleteAllCart = async (req, res) => {
   const { id } = req.params;
   try {
     const cart = await cartModel.findOneAndDelete({ user_id: id });
    await userModel.findByIdAndUpdate(id, { $set: { cart_id: null } });
     if (!cart) {
       return res.status(300).json({
         message: "Không tìm thấy giỏ hàng!",
         cart:[],
       });
     }
     return res.status(200).json({
       message: "Xóa tất cả sản phẩm trong giỏ hàng thành công!",
     });
   } catch (error) {
     return res.status(500).json({
       message: error.message,
     });
   }
}

export const getCartByUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await userModel.findById(id);
    if (!user)
      return res.status(500).json({ message: "Tài khoản không tồn tại!" });
    const cart = await cartModel.findOne({ user_id: user?._id }).populate({
      path: "products",
      populate: [
        {
          path: "product_id",
          select: "name image category_id"
        }
      ],
    });
    if (!cart)
      return res
        .status(300)
        .json({ message: "Danh sách giỏ hàng không tồn tại!", cart: [] });
    return res
      .status(200)
      .json({ message: "Danh sách giỏ hàng theo tài khoản!", cart });
  } catch (error) {
    return res.status(500).json({ message: "Error server: " + error.message });
  }
};
