import ProductModel from "../models/product.model";
import AuthorModel from "../models/author.model";
import PublisherModel from "../models/publisher.model";
import SupplierModel from "../models/supplier.model";
import CategoryModel from "../models/category.model";
import slugify from "slugify";

export const createProduct = async (req, res) => {
  const { name,
      author_id,
      category_id,
      publisher_id, 
      supplier_id, 
    } = req.body;
  try {
    const supplier = await SupplierModel.findById(supplier_id);
    if (!supplier)
      return res.status(400).json({
        success: false,
        message: "Nhà cung cấp không tồn tại: ",
      });
    const publisher = await PublisherModel.findById(publisher_id);
    if (!publisher)
      return res.status(400).json({
        success: false,
        message: "Nhà xuất bản không tồn tại: ",
      });
    const author = await AuthorModel.findById(author_id);
    if (!author)
      return res.status(400).json({
        success: false,
        message: "Tên tác giả không tồn tại: ",
      });
    const category = await CategoryModel.findById(category_id);
    if (!category)
      return res.status(400).json({
        success: false,
        message: "Danh mục không tồn tại: ",
      });
    const product = await ProductModel.findOne({
      name,
    });
    if (product)
      return res.status(400).json({
        success: false,
        message: "Tên cuốn sách đã tồn tại: ",
      });

    const newProduct = await ProductModel.create(req.body);
    if (!newProduct)
      return res.status(401).json({
        success: false,
        message: "Thêm mới cuốn sách thất bại!",
      });
    return res.status(200).json({
      success: true,
      message: "Thêm mới cuốn sách thành công!",
      product: newProduct,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Product error server: " + error.message,
    });
  }
};

export const getAllProducts = async (req, res) => {
  const {
    _page = 1,
    _limit = 10,
    _sort = "createdAt",
    _order = "asc",
    _expand,
    category_id,
    supplier_id,
    publisher_id,
    author_id,
    genre_id,
  } = req.query;
  const option = {
    page: _page,
    limit: _limit,
    sort: {
      [_sort]: _order === "desc" ? -1 : 1,
    },
  };
  let query = {};
  if (_expand) {
    query.name = _expand || "";
  }
 if (category_id) {
   query.category_id = category_id;
 }

 if (supplier_id) {
   query.supplier_id = supplier_id;
 }

 if (publisher_id) {
   query.publisher_id = publisher_id;
 }

 if (author_id) {
   query.author_id = author_id;
 }
 if (genre_id) {
   query.genre_id = genre_id;
 }
  try {
    const products = await ProductModel.paginate(query, {
      ...option,
      populate: [
        { path: "author_id", select: "name" },
        { path: "category_id", select: "name" },
        { path: "supplier_id", select: "name" },
        { path: "publisher_id", select: "name" },
        { path: "genre_id", select: "name" },
      ],
    });
    if (!products.docs || products.docs.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Không tìm thấy cuốn sách nào!",
        data: products.docs,
        pagination: {
          currentPage: products.page,
          totalPages: products.totalPages,
          totalItems: products.totalDocs,
        },
      });
    }
    res.status(200).json({
      success: true,
      message: "Lấy danh sách cuốn sách thành công ",
      data: products.docs,
      pagination: {
        currentPage: products.page,
        totalPages: products.totalPages,
        totalItems: products.totalDocs,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Product error server: " + error.message,
    });
  }
};

export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, author_id, category_id, publisher_id, supplier_id } = req.body;
  try {
    const supplier = await SupplierModel.findById(supplier_id);
    if (!supplier)
      return res.status(400).json({
        success: false,
        message: "Nhà cung cấp không tồn tại: ",
      });
    const publisher = await PublisherModel.findById(publisher_id);
    if (!publisher)
      return res.status(400).json({
        success: false,
        message: "Nhà xuất bản không tồn tại: ",
      });
    const author = await AuthorModel.findById(author_id);
    if (!author)
      return res.status(400).json({
        success: false,
        message: "Tên tác giả không tồn tại: ",
      });
    const category = await CategoryModel.findById(category_id);
    if (!category)
      return res.status(400).json({
        success: false,
        message: "Danh mục không tồn tại: ",
      });

    const product = await ProductModel.findOne({ _id: { $ne: id }, name });
    if (product)
      return res.status(400).json({
        success: false,
        message: "Tên cuốn sách đã tồn tại: " + name,
      });
      const updateProductSlug = slugify(name, { lower: true });
    const updateProduct = await ProductModel.findByIdAndUpdate(
      id,
      { ...req.body,slug: updateProductSlug },
      { new: true }
    );
    if (!updateProduct)
      return res.status(401).json({
        success: false,
        message: "Cập nhật cuốn sách thất bại!",
      });
    return res.status(200).json({
      success: true,
      message: "Cập nhật cuốn sách thành công!",
      product: updateProduct,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Product error server: " + error.message,
    });
  }
};

export const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await ProductModel.findById(id)
      .populate("author_id", "name")
      .populate("category_id", "name")
      .populate("supplier_id", "name")
      .populate("publisher_id", "name")
      .populate("genre_id", "name");
    if (!product)
      return res.status(400).json({
        success: false,
        message: "Cuốn sách đã không tồn tại!",
      });
    return res.status(200).json({
      success: true,
      message: "Lấy cuốn sách thành công!",
      product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Product error server: " + error.message,
    });
  }
};

// export const deletePublisher = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const publisher = await ProductModel.findById(id);
//     if (!publisher)
//       return res.status(400).json({
//         success: false,
//         message: "Nhà xuất bản đã không tồn tại!",
//       });
//     await publisher.delete();
//     return res
//       .status(200)
//       .json({ publisher, message: "Xóa mềm nhà xuất bản thành công!" });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Publisher error server: " + error.message,
//     });
//   }
// };

// export const restorePublisher = async (req, res) => {
//   try {
//     const _id = req.params.id;
//     const publisher = await ProductModel.findOneDeleted({ _id });

//     if (!publisher) {
//       return res.status(404).json({
//         success: false,
//         message: "Không tìm thấy nhà xuất bản!",
//       });
//     }

//     await publisher.restore();
//     return res.status(200).json({
//       publisher,
//       message: "Khôi phục nhà xuất bản thành công!",
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Publisher error server: " + error.message,
//     });
//   }
// };

// export const forceDeletePublisher = async (req, res) => {
//   try {
//     const _id = req.params.id;
//     const publisher = await ProductModel.findOneDeleted({ _id });
//     if (!publisher) {
//       return res.status(404).json({
//         success: false,
//         message: "Không tìm thấy nhà xuất bản này!",
//       });
//     }
//     const result = await ProductModel.deleteOne({ _id });

//     if (result.deletedCount === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "Không tìm thấy nhà xuất bản này!",
//       });
//     }
//     return res.status(200).json({
//       success: true,
//       message: `Đã xóa vĩnh viễn nhà xuất bản!`,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Publisher error server: " + error.message,
//     });
//   }
// };

// export const getAllDeletePublisher = async (req, res) => {
//   const {
//     _page = 1,
//     _limit = 10,
//     _sort = "createdAt",
//     _order = "asc",
//     _expand,
//   } = req.query;

//   try {
//     const skip = (_page - 1) * _limit; // Số bản ghi bỏ qua
//     const sortOptions = {
//       [_sort]: _order === "desc" ? -1 : 1,
//     };
//     // Điều kiện tìm kiếm nhà xuất bản đã bị xóa mềm (deleted: true)
//     const query = {};

//     // Nếu có yêu cầu mở rộng (_expand), thêm điều kiện tìm kiếm theo tên
//     if (_expand) {
//       query.name = _expand || "";
//     }
//     const publishers = await ProductModel.findDeleted(query)
//       .sort(sortOptions)
//       .skip(skip)
//       .limit(_limit);
//     // Tính toán thông tin phân trang
//     const totalItems = await ProductModel.countDeleted(query);
//     const totalPages = Math.ceil(totalItems / _limit);
//     if (!publishers || publishers.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Không tìm thấy nhà xuất bản nào!",
//         data: publishers,
//         pagination: {
//           currentPage: +_page,
//           totalPages: totalPages,
//           totalItems: totalItems,
//         },
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Lấy nhà xuất bản thành công",
//       data: publishers,
//       pagination: {
//         currentPage: +_page,
//         totalPages: totalPages,
//         totalItems: totalItems,
//       },
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Publisher error server: " + error.message,
//     });
//   }
// };