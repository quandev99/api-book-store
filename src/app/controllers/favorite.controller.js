import favoriteModel from '../models/favorite.model'
import productModel from '../models/product.model'
import userModel from '../models/user.model'

export const addFavoriteProduct = async (req, res) => {
  try {
    const { productId:product_id, userId: user_id } = req.body;
    if (!user_id)
      return res.status(400).json({
        message: `Bạn cần đăng nhập mới thực hiện được chức năng này`,
      });
    const existUser = await userModel.findById(user_id);
    if (!existUser)
      return res.status(400).json({ message: `Tài khoản có ID ${user_id} không tồn tại` })
    const existProduct = await productModel.findById(product_id);
    if (!existProduct)
      return res.status(400).json({ message: `Sản phẩm không tồn tại` })

    let favoriteProduct = await favoriteModel.findOne({ user_id});
     if (!favoriteProduct) {
       favoriteProduct = await favoriteModel.create({
         user_id,
         products: [],
       });
       await userModel.findByIdAndUpdate(user_id, {
         favorite_id: favoriteProduct._id,
       });
     }
       const productIndex = favoriteProduct.products.findIndex(
         (product) => product.toString() === product_id
       );
       if (productIndex === -1) {
         favoriteProduct.products.push(product_id);
         existProduct.favorite_count++;
         await existProduct.save();
         await favoriteProduct.save();
         return res.status(200).json({
           message: "Sản phẩm đã được đưa vào danh sách yêu thích",
           favorite: favoriteProduct,
           success: true,
         });
       } else {
         favoriteProduct.products.splice(productIndex, 1);
         existProduct.favorite_count--;
         await existProduct.save();
         await favoriteProduct.save();
         return res.status(200).json({
           message: "Sản phẩm đã bị xóa khỏi danh sách yêu thích",
           favorite: favoriteProduct,
           success: true,
         });
       }
  } catch (error) {
    return res.status(500).json({
      message: "Favorite error server: " + error.message,
    });
  }
}


export const getFavoriteProductsByUserId = async (req, res) => {
  const { userId:user_id } = req.params;
  try {
    const favorite = await favoriteModel
      .findOne({ user_id })
      .populate("products");
    if (!favorite) {
      return res.status(400).json({
        message: `Không tìm thấy danh sách sản phẩm yêu thích của người dùng có ID ${user_id}`,
      });
    }
    return res.status(200).json({
      message: `Danh sách sản phẩm yêu thích của người dùng có ID ${user_id}`,
      favorite,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Lỗi server",
    });
  }
};