import Joi from "joi";

export const reviewValidationsSchema = Joi.object({
  user_id: Joi.string().required(),
  product_id: Joi.string().required(),
  bill_id: Joi.string().required(),
  rating_start: Joi.number().required().min(1).max(5).message({
    "any.required": "Vui lòng đánh giá",
  }),
  comment: Joi.string().max(500),
  images: Joi.array(),
});
