import discountModel from '../models/discount.model'
import discountCart from '../models/cart.model'
import { isExpired } from '../../until'
export const createDiscount = async (req, res) => {
  const dataDiscount = req.body
  const { discount_name, discount_code, expiration_date } = req.body
  try {
    const checkName = await discountModel.findOne({ discount_name })
    if (checkName) {
      return res.status(400).json({
        message: 'tên khuyễn mãi đã tồn tại !'
      })
    }

    if (isExpired(expiration_date)) {
      return res.status(400).json({
        message: 'Thời gian hết hạn phải lớn hơn thời gian hiện tại !'
      })
    }

    const checkCode = await discountModel.findOne({ discount_code })
    if (checkCode) {
      return res.status(400).json({
        message: 'tên mã code giảm giá đã tồn tại !'
      })
    }
    const discount = await discountModel.create({ ...dataDiscount })
    if (!discount) {
      return res.status(404).json({
        error: 'Tạo phiếu giảm giá thất bại'
      })
    }

    return res.status(200).json({
      message: 'Tạo phiếu giảm giá thành công',
      discount,
      success: true
    })
  } catch (error) {
    return res.status(500).json({
      message: error.message
    })
  }
}
export const applyDiscountToCart = async (req, res) => {
  const { userId: user_id, discountCode: discount_code, totalPrice } = req.body
  try {
    const cart = await discountCart.findOne({ user_id })
    if (!cart) {
      return res.status(400).json({ message: 'Giỏ hàng không tồn tại.' })
    }

    const checkDiscount = await discountModel.findOne({ discount_code })
    if (!checkDiscount) {
      return res.status(400).json({ message: 'Mã giảm giá không tồn tại' })
    }

    // if (checkDiscount.isSpecial) {
    //   if (!checkDiscount.users.includes(user_id)) {
    //     return res
    //       .status(400)
    //       .json({ message: "Mã giảm giá không áp dụng được cho bạn." });
    //   }
    // }
    const grandTotalPrice = cart.totals.find(
      item => item.code === 'grand_total'
    ).price

    if (Number(grandTotalPrice) < Number(checkDiscount.discount_amount)) {
      return res
        .status(400)
        .json({ message: 'Số tiền không đủ điều kiện để sử dụng mã giảm giá' })
    }

    if (checkDiscount?.used_by_users?.includes(user_id)) {
      return res
        .status(400)
        .json({ message: 'Mã giảm giá đã hết lần sử dụng!' })
    }

    if (isExpired(checkDiscount.expiration_date)) {
      // Kiểm tra điều kiện áp dụng mã khuyến mãi
      return res.status(400).json({ message: 'Mã khuyến mãi đã hết hạn.' })
    }

    // Kiểm tra điều kiện áp dụng mã khuyến mãi
    if (checkDiscount.discount_quantity <= 0) {
      return res.status(400).json({ message: 'Mã khuyến mãi đã hết số lượng.' })
    }

    // Lấy thông tin giỏ hàng của người dùng
    // const cart = await Cart.findOne({
    //   user_id,
    //   _id: cartId,
    // });

    // Kiểm tra xem mã khuyến mãi đã được áp dụng vào giỏ hàng chưa
    // if (cart.coupon_id) {
    //   return res
    //     .status(400)
    //     .json({ message: "Mã khuyến mãi đã được áp dụng vào giỏ hàng" });
    // }

    if (grandTotalPrice <= checkDiscount.min_purchase_amount) {
      return res
        .status(400)
        .json({ message: 'Không đủ điều kiện áp dụng mã giảm giá.' })
    }

    const totalOrder = grandTotalPrice - checkDiscount.discount_amount

    // if (discount.used_by_users && discount.used_by_users.indexOf(user_id) !== -1) {
    //   cart.discount_code = discount.discount_code;
    //   cart.cart_couponPrice = discount.discount_amount;
    //   await cart.save();
    //   return res.status(200).json({
    //     message: "Mã khuyến mãi đã được áp dụng vào giỏ hàng.",
    //     cart,
    //   });
    // }

    cart.discount_id = checkDiscount._id

    const subtotal = calculateSubtotal(cart.products)
    const grandTotal = calculateGrandTotal(
      subtotal,
      checkDiscount.discount_amount
    )
    // Cập nhật totals trong giỏ hàng
    cart.totals = [
      {
        code: 'subtotal',
        title: 'Thành tiền',
        price: subtotal
      },
      {
        code: 'discount',
        title: 'Thành tiền',
        price: discountPrice ? discountPrice : 0
      },
      {
        code: 'grand_total',
        title: 'Tổng Số Tiền (gồm VAT)',
        price: grandTotal
      }
    ]
    // const newTotal = {
    //   code: "Discount",
    //   title: "Thành tiền",
    //   price: checkDiscount.discount_amount,
    // };
    // cart.totals.splice(1, 0, newTotal);
    await cart.save()
    return res.status(200).json({
      message: 'Mã khuyến mãi đã được áp dụng vào giỏ hàng.',
      // cart,
      discount: checkDiscount._id,
      totalOrder,
      success: true
    })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

export const updateDiscount = async (req, res) => {
  const { discount_name, discount_code, expiration_date } = req.body
  const { id: _id } = req.params
  try {
    const discount = await discountModel.findById(_id)
    if (!discount) {
      return res.status(400).json({
        message: 'Không tìm thấy thông tin mã giảm giá!'
      })
    }

    const discountName = await discountModel.findOne({
      $and: [
        { _id: { $ne: _id } }, // Không tìm kiếm theo _id hiện tại
        { discount_name } // Tìm kiếm theo discount_name
      ]
    })
    const discountCode = await discountModel.findOne({
      $and: [
        { _id: { $ne: _id } }, // Không tìm kiếm theo _id hiện tại
        { discount_code } // Tìm kiếm theo discount_code
      ]
    })
    if (discountName || discountCode) {
      return res.status(400).json({
        message: 'Tên hoặc mã code giảm giá đã tồn tại !'
      })
    }
    if (isExpired(expiration_date)) {
      return res.status(400).json({
        message: 'Thời gian hết hạn phải lớn hơn thời gian hiện tại !'
      })
    }
    const discountNew = await discountModel.findByIdAndUpdate(
      { _id },
      { ...req.body },
      {
        new: true,
        upsert: true
      }
    )
    if (!discountNew || discountNew.length == 0) {
      return res.status(400).json({
        message: 'Cập nhật giảm giá thất bại'
      })
    }
    return res.status(200).json({
      message: 'Cập nhật giảm giá thành công',
      discount: discountNew,
      success: true
    })
  } catch (error) {
    return res.status(500).json({
      message: 'Error Discount server: ' + error.message
    })
  }
}

export const getAllDiscounts = async (req, res) => {
  const {
    _page = 1,
    _limit = 10,
    _sort = 'updatedAt',
    _order = 'asc',
    _search = '',
    _discount_code = ''
  } = req.query

  const option = {
    page: +_page,
    limit: +_limit,
    sort: {
      [_sort]: _order === 'desc' ? 1 : -1
    }
  }
  let query = {}

  if (_search || _discount_code) {
    query.$or = []
    if (_search) {
      query.$or.push({
        discount_name: { $regex: _search, $options: 'i' }
      })
    }
    if (_discount_code) {
      query.$or.push({
        discount_code: { $regex: _discount_code, $options: 'i' }
      })
    }
  }

  try {
    const discounts = await discountModel.paginate(query, {
      ...option,
      populate: [{ path: 'discount_users' }, { path: 'discount_used_by_users' }]
    })
    if (!discounts.docs || discounts.docs.length === 0) {
      return res.status(200).json({
        success: false,
        message: 'Danh sách bill trống!',
        discounts: discounts.docs,
        pagination: {
          currentPage: discounts.page,
          totalPages: discounts.totalPages,
          totalItems: discounts.totalDocs
        }
      })
    }
    return res.status(200).json({
      success: true,
      message: 'Danh sách tác giả !',
      discounts: discounts.docs,
      pagination: {
        currentPage: discounts.page,
        totalPages: discounts.totalPages,
        totalItems: discounts.totalDocs
      }
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'discounts error server: ' + error.message
    })
  }
}

export const removeDiscount = async (req, res) => {
  try {
    const discount = await discountModel.findByIdAndDelete(req.params.id)
    if (!discount) {
      return res.status(406).json({
        message: 'Xóa phiếu giảm giá thất bại'
      })
    }
    return res.status(200).json({
      message: 'Xóa phiếu giảm giá thành công!',
      discount,
      success: true
    })
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Discount error server' + error.message })
  }
}

function calculateGrandTotal (subtotal, discountPrice = 0) {
  if (discountPrice > 0) return subtotal - discountValue
  return subtotal
}

function calculateSubtotal (products) {
  const subtotal = products.reduce((total, product) => {
    if (product.is_checked) {
      total +=
        product.quantity * (product.discounted_price || product.product_price)
    }
    return total
  }, 0)
  return subtotal
}
