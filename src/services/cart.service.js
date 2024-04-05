'use strict';

import cartModel from "../app/models/cart.model";


const findCartByUser = async ( user_id)=>{
  const cart = await cartModel.findOne({user_id});
  return cart;
}
const saveCartByUser = async ( user_id)=>{
  const cart = await cartModel.findOne({user_id}).lean();
  return cart;
}



export { findCartByUser };