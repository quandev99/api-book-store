import productModel from "../models/product.model";
import reviewModel from "../models/review.model";
import userModel from "../models/user.model";
import billModel from "../models/bill.model";
import { reviewValidationsSchema } from "../validations/review.validation";
export const addReview = async (req, res) => {
  const {
    user_id,
    product_id,
    bill_id,
    rating_start,
    comment,
    images,
  } = req.body;

  try {
    const { error } = reviewValidationsSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      const errors = error.details.map((err) => err.message);
      return res.status(400).json({
        message: errors,
      });
    }

    if (!user_id) {
      return res.status(400).json({
        message: "Bạn cần đăng nhập để thực hiện chức năng này",
      });
    }

    const user = await userModel.findById({_id:user_id});
    if (!user) {
      return res.status(400).json({
        message: `Tài khoản với ID ${user_id} không tồn tại`,
      });
    }

    const product = await productModel.findById({_id:product_id});
    if (!product) {
      return res.status(400).json({
        message: `Sản phẩm với ID ${product_id} không tồn tại`,
      });
    }

    const existingReview = await reviewModel.findOne({
      user_id,
      product_id,
      bill_id,
    });

    if (existingReview) {
      return res
        .status(400)
        .json({ message: "Bạn đã đánh giá sản phẩm này trước đó." });
    }

    const bill = await billModel.findById({ _id: bill_id })

    if (!bill 
      // || bill.bill_status === "Completed"
      ) {
      return res.status(400).json({
        message:
          "Bạn cần mua và nhận giao sản phẩm thành công trước khi đánh giá.",
      });
    }

    const dataReview = {
      user_name: user.name,
      user_id,
      product_id,
      rating_start,
      comment,
      images,
      bill_id,
    };

    const review = await reviewModel.create(dataReview);
    if (!review) {
      return res.status(400).json({
        message: "Đánh giá sản phẩm thất bại",
      });
    }

    const reviews = await reviewModel.find({ product_id });
    const totalRating = reviews.reduce(
      (a, b) => a + b.rating_start,
      0
    );
    const reviewCount = reviews.length;
    const averageScore = totalRating / reviewCount;

    product.average_score = Math.round(averageScore);
    product.review_count = reviewCount;
    await product.save();

    bill.is_review = true;
    bill.save();

    return res.status(200).json({
      message: "Đánh giá sản phẩm thành công",
      review,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const getAllReviews = async (req, res) => {
  const {
    _page = 1,
    _sort = "createdAt",
    _limit = 10,
    _order = "asc",
    _search,
  } = req.query;
  const options = {
    page: _page,
    sort: { [_sort]: _order === "desc" ? 1 : -1 },
    limit: _limit,
  };
  let query = {};
  if (_search) {
    query.$or = [];
    query.$or.push({
      user_name: { $regex: _search, $options: "i" },
      comment: { $regex: _search, $options: "i" },
    });
  }
  try {
    const reviews = await reviewModel.paginate({...query}, {
      ...options,
      populate: [
        { path: "user_id", select: "name image.url" },
        { path: "product_id", select: "name image" },
      ],
    });

    if (!reviews || reviews.docs.length === 0) {
      return res.status(300).json({
        message: `Chưa có đánh giá cuốn sách này.`,
        reviews: reviews.docs,
        pagination: {
          currentPage: reviews.page,
          totalPages: reviews.totalPages,
          totalItems: reviews.totalDocs,
          limit: reviews.limit,
        },
      });
    }
    return res.status(200).json({
      message: `Lấy được danh sách đánh giá sản phẩm thành công`,
      reviews: reviews.docs,
      pagination: {
        currentPage: reviews.page,
        totalPages: reviews.totalPages,
        totalItems: reviews.totalDocs,
        limit: reviews.limit,
      },
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Lỗi server",
    });
  }
};
export const getReviewProductId = async (req, res) => {
  const {
    _page = 1,
    _sort = "createdAt",
    _limit = 1,
    _order = "asc",
  } = req.query;

  const options = {
    page: _page,
    sort: { [_sort]: _order === "desc" ? 1 : -1 },
    limit: _limit,
  };
  const { productId } = req.params;

  try {
    const reviews = await reviewModel.paginate(
      { product_id: productId, active: false },
      { ...options, populate: [{ path: "user_id" }] }
    );

    if (!reviews || reviews.docs.length === 0) {
      return res.status(200).json({
        message: `Chưa có đánh giá cuốn sách này.`,
        review: reviews.docs,
        pagination: {
          currentPage: reviews.page,
          totalPages: reviews.totalPages,
          totalItems: reviews.totalDocs,
          limit: reviews.limit,
        },
      });
    }
    return res.status(200).json({
      message: `Lấy được danh sách đánh giá sản phẩm thành công`,
      review: reviews.docs,
      pagination: {
        currentPage: reviews.page,
        totalPages: reviews.totalPages,
        totalItems: reviews.totalDocs,
        limit: reviews.limit,
      },
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Lỗi server",
    });
  }
};
export const hiddenReview = async(req, res) => {
  const  {reviewId} = req.params;
  try {
     // Tìm bình luận dựa trên ID
    const review = await reviewModel.findById({ _id: reviewId });
    if (!review) {
      return res.status(404).json({ message: 'Bình luận không tồn tại' });
    }
    // Đảo ngược trạng thái active của bình luận
    review.active = !review.active;

    // Lưu bình luận đã được cập nhật vào cơ sở dữ liệu
    await review.save();

    return res
      .status(200)
      .json({ message: "Trạng thái bình luận đã được cập nhật", review });
  
  } catch (error) {
    
  }
};
