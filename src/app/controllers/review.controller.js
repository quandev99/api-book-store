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
      (totalRating, rating_star) => totalRating + rating_star.rating_star,
      0
    );

    const reviewCount = reviews.length;
    const averageScore = totalRating / reviewCount;

    product.average_score = Number(Math.round(averageScore));
    product.review_count = reviewCount;
    await product.save();

    bill.isReview = true;
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
