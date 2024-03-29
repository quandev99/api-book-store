'use strict';

import discountModel from "../app/models/discount.model";


const findDiscountById = async ( _id)=>{
  const discount = await discountModel.findById(_id).lean();
  return discount;
}

const checkTimeDiscount = async () => {
  const discount = await discountModel

}

export { findDiscountById };