import userModel from '../models/user.model'
import productModel from '../models/product.model'
import cartModel from '../models/cart.model'

export const addToCart = async (req, res) => {
  const { userId, productId, quantity = 1 } = req.body
  try {
    const user = await userModel.findById(userId);
    const product = await productModel.findById(productId);
    if (!user || !product) {
      return res
        .status(404)
        .json({ message: "Tài khoản hoặc sản phẩm không tồn tại!" });
    }
    const { _id: user_id } = user;
    let cart = await cartModel.findOne({ user_id });
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
        product_name: product.name,
        product_image: product?.image[0]?.url || "",
        quantity,
      });
    }
    // Tính lại grand_total và subtotal
    const subtotal = calculateSubtotal(cart.products);
    const grandTotal = calculateGrandTotal(subtotal);
    // Cập nhật totals trong giỏ hàng
    cart.totals = [
      {
        code: "subtotal",
        title: "Thành tiền",
        price: subtotal,
      },
      {
        code: "grand_total",
        title: "Tổng Số Tiền (gồm VAT)",
        price: grandTotal,
      },
    ];
    await cart.save();
    return res
      .status(200)
      .json({ message: "Sản phẩm đã được thêm vào giỏ hàng!", cart });
  } catch (error) {
    return res.status(500).json({ message: 'Error server: ' + error.message })
  }
}
export const addCheckedProduct = async (req, res) => {
  const { isChecked, productId, userId } = req.body;
  try {
    const user = await userModel.findById(userId);
    const product = await productModel.findById(productId);

    if (!user || !product) {
      return res
        .status(404)
        .json({ message: "Tài khoản hoặc sản phẩm không tồn tại!" });
    }

    const { _id: user_id } = user;
    let cart = await cartModel.findOne({ user_id });

    if (!cart) {
      // Xử lý nếu giỏ hàng không tồn tại
      return res.status(404).json({ message: "Giỏ hàng không tồn tại!" });
    }

    // Kiểm tra xem sản phẩm có tồn tại trong giỏ hàng không
    const productToUpdate = cart.products.find((product) =>
      product.product_id.equals(productId)
    );

    if (productToUpdate) {
      // Cập nhật trạng thái is_checked từ frontend
      productToUpdate.is_checked = isChecked;

      // Tính lại grand_total dựa trên sản phẩm có is_checked
      const subtotal = calculateSubtotal(cart.products);
      const grandTotal = calculateGrandTotal(subtotal);

      // Thêm grand_total vào mảng totals
      cart.totals = [
        {
          code: "subtotal",
          title: "Thành tiền",
          price: subtotal,
        },
        {
          code: "grand_total",
          title: "Tổng Số Tiền (gồm VAT)",
          price: grandTotal,
        },
      ];

      // Lưu lại giỏ hàng sau khi cập nhật
      await cart.save();

      return res
        .status(200)
        .json({ message: "Sản phẩm đã được thêm vào giỏ hàng!", cart,success:true });
    }

    return res
      .status(404)
      .json({ message: "Sản phẩm không tồn tại trong giỏ hàng!" });
  } catch (error) {
    return res.status(500).json({ message: "Error server: " + error.message });
  }


};
export const addCheckedAllProduct = async (req, res) => {
  const { isChecked, userId } = req.body;
  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Tài khoản không tồn tại!" });
    }

    const { _id: user_id } = user;

    // Update is_checked for all products in the cart
    const updatedCart = await cartModel.findOneAndUpdate(
      { user_id },
      {
        $set: {
          "products.$[].is_checked": isChecked,
        },
      },
      { new: true }
    );

    if (!updatedCart) {
      return res.status(404).json({ message: "Giỏ hàng không tồn tại!" });
    }

    // Tính lại grand_total dựa trên sản phẩm có is_checked
    const subtotal = calculateSubtotal(updatedCart.products);
    const grandTotal = calculateGrandTotal(subtotal);

    // Thêm grand_total vào mảng totals
    updatedCart.totals = [
      {
        code: "subtotal",
        title: "Thành tiền",
        price: subtotal,
      },
      {
        code: "grand_total",
        title: "Tổng Số Tiền (gồm VAT)",
        price: grandTotal,
      },
    ];

    // Lưu lại giỏ hàng sau khi cập nhật
    await updatedCart.save();

    return res.status(200).json({
      message: "Sản phẩm đã được cập nhật trong giỏ hàng!",
      cart: updatedCart,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error server: " + error.message });
  }
};



export const updateCartItem = async (req, res) => {
  const { userId, productId, quantity } = req.body
  try {
    const user = await userModel.findById(userId)
    const product = await productModel.findById(productId)
    if (!user || !product) {
      return res
        .status(404)
        .json({ message: 'Tài khoản hoặc sản phẩm không tồn tại!' })
    }
    const { _id: user_id } = user
    const cart = await cartModel.findOne({ user_id })

    if (!cart) {
      return res.status(404).json({ message: 'Giỏ hàng không tồn tại' })
    }
    const existingItem = cart.products.find(item =>
      item.product_id.equals(productId)
    )
    if (!existingItem) {
      return res
        .status(404)
        .json({ message: 'Sản phẩm không tồn tại trong giỏ hàng' })
    }
    if (quantity > product?.quantity)
      return res
        .status(402)
        .json({ message: 'Sản phẩm đặt hàng vượt quá số lượng kho' })

    existingItem.quantity = +quantity
    // Cập nhật tổng giá và tổng số lượng trong giỏ hàng
    cart.cart_totalPrice = cart.products.reduce(
      (total, item) => total + item.product_price * item.quantity,
      0
    )
    cart.cart_totalOrder = cart.products.reduce(
      (total, item) => total + item.quantity,
      0
    )

    // Lưu giỏ hàng đã được cập nhật
    await cart.save()
    return res
      .status(200)
      .json({ message: 'Sản phẩm trong giỏ hàng đã được cập nhật', cart })
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi server: ' + error.message })
  }
}

export const removeCartItem = async (req, res) => {
  const { userId, productId } = req.body
  try {
    const cart = await cartModel.findOne({ user_id: userId });
    if (!cart) {
      return res.status(404).json({ message: "Giỏ hàng không tồn tại" });
    }

    const existingItemIndex = cart.products.findIndex((item) =>
      item._id.equals(productId)
    );

    if (existingItemIndex === -1) {
      return res
        .status(404)
        .json({ message: "Sản phẩm không tồn tại trong giỏ hàng" });
    }

    // Lọc ra những sản phẩm không có productId
    cart.products.splice(existingItemIndex, 1);

    // Tính lại grand_total dựa trên sản phẩm có is_checked
    const subtotal = calculateSubtotal(cart.products);
    const grandTotal = calculateGrandTotal(subtotal);

    // Thêm grand_total vào mảng totals
    cart.totals = [
      {
        code: "subtotal",
        title: "Thành tiền",
        price: subtotal,
      },
      {
        code: "grand_total",
        title: "Tổng Số Tiền (gồm VAT)",
        price: grandTotal,
      },
    ];

    // Lưu giỏ hàng đã được cập nhật
    await cart.save();

    return res
      .status(200)
      .json({
        message: "Sản phẩm đã được xóa khỏi giỏ hàng",
        cart,
        success: true,
      });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi server: ' + error.message })
  }
}
export const increaseQuantity = async (req, res) => {
  const { userId, productId } = req.body;
  try {
    const cart = await cartModel.findOne({ user_id: userId });
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

    // Tăng số lượng sản phẩm
    existingItem.quantity += 1;

    // Lưu giỏ hàng đã được cập nhật
    await cart.save();
    console.log("cart", cart);

    // Tính lại grand_total dựa trên sản phẩm có is_checked
    const subtotal = calculateSubtotal(cart.products);
    const grandTotal = calculateGrandTotal(subtotal);

    // Thêm grand_total vào mảng totals
    cart.totals = [
      {
        code: "subtotal",
        title: "Thành tiền",
        price: subtotal,
      },
      {
        code: "grand_total",
        title: "Tổng Số Tiền (gồm VAT)",
        price: grandTotal,
      },
    ];
     await cart.save();

    return res.status(200).json({
      message: "Số lượng sản phẩm đã được tăng",
      cart,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server: " + error.message });
  }
};
export const decreaseQuantity = async (req, res) => {
  const { userId, productId } = req.body;
  try {
    const cart = await cartModel.findOne({ user_id: userId });
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

    // Giảm số lượng sản phẩm, đảm bảo số lượng không âm
    existingItem.quantity = Math.max(existingItem.quantity - 1, 0);

    // Lưu giỏ hàng đã được cập nhật
    await cart.save();

    // Tính lại grand_total dựa trên sản phẩm có is_checked
    const subtotal = calculateSubtotal(cart.products);
    const grandTotal = calculateGrandTotal(subtotal);

    // Thêm grand_total vào mảng totals
    cart.totals = [
      {
        code: "subtotal",
        title: "Thành tiền",
        price: subtotal,
      },
      {
        code: "grand_total",
        title: "Tổng Số Tiền (gồm VAT)",
        price: grandTotal,
      },
    ];
 await cart.save();
    return res.status(200).json({
      message: "Số lượng sản phẩm đã được giảm",
      cart,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server: " + error.message });
  }
};

export const deleteAllCart = async (req, res) => {
  const { id } = req.params
  try {
    const cart = await cartModel.findOneAndDelete({ user_id: id })
    await userModel.findByIdAndUpdate(id, { $set: { cart_id: null } })
    if (!cart) {
      return res.status(300).json({
        message: 'Không tìm thấy giỏ hàng!',
        cart: []
      })
    }
    return res.status(200).json({
      message: 'Xóa tất cả sản phẩm trong giỏ hàng thành công!'
    })
  } catch (error) {
    return res.status(500).json({
      message: error.message
    })
  }
}
export const getCartByUser = async (req, res) => {
  const { id } = req.params;
  try {
    // Fetch user and cart data in parallel
    const [user, cart] = await Promise.all([
      userModel.findById(id),
      cartModel.findOne({ user_id: id }).populate({
        path: "products",
        populate: [
          {
            path: "product_id",
            select: "name image category_id price",
          },
        ],
      }),
    ]);

    // Return 404 if the user is not found
    if (!user) {
      return res.status(404).json({ message: "Tài khoản không tồn tại!" });
    }

    // Check if the cart exists
    if (!cart) {
      return res.status(300).json({
        message: "Danh sách giỏ hàng không tồn tại!",
        cart: [],
      });
    }

    // Return the cart data
    return res.status(200).json({
      message: "Danh sách giỏ hàng theo tài khoản!",
      cart,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error server: " + error.message });
  }
};

// export const getCartByUser = async (req, res) => {
//   const { id } = req.params
//   try {
//     const user = await userModel.findById(id)
//     if (!user)
//       return res.status(500).json({ message: 'Tài khoản không tồn tại!' })
//     const cart = await cartModel.findOne({ user_id: user?._id }).populate({
//       path: 'products',
//       populate: [
//         {
//           path: 'product_id',
//           select: 'name image category_id price'
//         }
//       ]
//     })
//     if (!cart)
//       return res
//         .status(300)
//         .json({ message: 'Danh sách giỏ hàng không tồn tại!', cart: [] })
//     return res
//       .status(200)
//       .json({ message: 'Danh sách giỏ hàng theo tài khoản!', cart })
//   } catch (error) {
//     return res.status(500).json({ message: 'Error server: ' + error.message })
//   }
// }


/// 
  // Hàm tính lại grand_total dựa trên sản phẩm có is_checked
  function calculateGrandTotal(subtotal) {
    return subtotal;
  }

  // Hàm tính lại subtotal dựa trên sản phẩm có is_checked
  function calculateSubtotal(products) {
    const subtotal = products.reduce((total, product) => {
      if (product.is_checked) {
        total += product.quantity * product.product_price;
      }
      return total;
    }, 0);
    return subtotal;
  }