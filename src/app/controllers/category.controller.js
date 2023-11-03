import Category from "../models/category.model";
import Product from "../models/product.model";
import slugify from "slugify";
import { ObjectId } from "mongodb";

export const createCategory = async (req, res) => {
  const { name, image, parent } = req.body;

  try {
    const nameExits = await Category.findOne({ name });
    if (nameExits)
      return res.status(402).json({ message: "Category đã tồn tại" });

    const newCategory = new Category({ ...req.body });

    if (parent) {
      const parentCategory = await Category.findById(parent);
      if (!parentCategory) {
        return res.status(404).json({ message: "Danh mục cha không tồn tại" });
      }
      await newCategory.save();
      // Thêm danh mục mới vào danh mục con của danh mục cha
      parentCategory.subcategories.push(newCategory._id);
      await parentCategory.save();
    }
    await newCategory.save();
    return res.json({
      category: newCategory,
      message: "Thêm danh mục thành công!",
    });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server Category: " + error });
  }
};
export const getAllCategories = async (req, res) => {
  const {
    _page = 1,
    _limit = 10,
    _sort = "createdAt",
    _order = "asc",
    _expand,
    _parent = "",
  } = req.query;
  const option = {
    page: _page,
    limit: _limit,
    sort: {
      [_sort]: _order === "desc" ? -1 : 1,
    },
  };
  let query = {};
  if (_parent) query.parent = _parent || "";

  // Modify the populate variable to select only the main categories
  const populate = _expand
    ? [
        { path: "parent", select: "-updatedAt" },
        { path: "subcategories", select: "-updatedAt" },
      ]
    : [
        { path: "parent", select: "-updatedAt" },
        { path: "subcategories", select: "-updatedAt" },
      ];

  try {
    const categories = await Category.paginate(query, {
      option,
      populate,
    });

    // Filter out subcategories from the result
    const mainCategories = categories.docs.filter(
      (category) => !category.parent
    );

    if (!mainCategories || mainCategories.length === 0) {
      return res.status(400).json({
        message: "Không tìm thấy danh mục nào!",
        data: mainCategories,
        pagination: {
          currentPage: categories.page,
          totalPages: categories.totalPages,
          totalItems: categories.totalDocs,
        },
      });
    }

    return res.status(200).json({
      message: "Lấy danh mục thành công",
      data: mainCategories,
      pagination: {
        currentPage: categories.page,
        totalPages: categories.totalPages,
        totalItems: mainCategories.length,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error Category: "+error.message,
    });
  }
};

export const getCategoryById = async (req, res) => {
  const categoryId = req.params.id;

  try {
    const category = await Category.findById(categoryId)
      .populate({ path: "parent", select: "name" })
      .populate({ path: "subcategories", select: "name" });

    if (!category)
      return res.status(500).json({ message: "Không tìm thấy danh mục!" });

    return res
      .status(200)
      .json({ category, message: "Get success fully categoryById" });
  } catch (error) {}
};

export const updateCategory = async (req, res) => {
  const id = req.params.id;
  const { name, image, parent } = req.body;
  try {
    const category = await Category.findById(id);
    if (!category)
      return res.status(404).json({ message: "Category not found ." });
    const updateCategorySlug = slugify(name, { lower: true });
    if (parent) {
      const parentCategory = await Category.findById(parent);
      if (!parentCategory) {
        return res.status(404).json({ message: "Danh mục cha không tồn tại" });
      }
      category.parent = parentCategory._id;
      await category.save();
      parentCategory.subcategories.push(id);
      await parentCategory.save();
    }
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { ...req.body, slug: updateCategorySlug },
      {
        new: true,
      }
    );
    return res.status(201).json({
      category: updatedCategory,
      message: "Updated category successfully",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Category error server: " + error.message,
    });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const _id = req.params.id;
    const category = await Category.findById({ _id });
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy danh mục này!",
      });
    } else if (
      category &&
      category.parent === null &&
      category.subcategories.length < 1
    ) {
      const result = await Category.deleteOne({ _id });
      if (result.deletedCount === 0) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy danh mục này!",
        });
      }
      return res.status(200).json({
        success: true,
        message: `Đã xóa vĩnh viễn danh mục này!`,
      });
    }else if (
      category &&
      category.parent === null &&
      category.subcategories.length >= 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Không thể xóa danh mục này bởi vì đang còn ràng buộc!",
      });
    }
    await category.delete();
    return res
      .status(201)
      .json({ category, message: "Xóa mềm danh mục thành công!" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server not found Category: " + error.message });
  }
};
export const restoreCategory = async (req, res) => {
  try {
    const _id = req.params.id;
    const category = await Category.findOneDeleted({ _id });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy danh mục này!",
      });
    }
    // const products = await Product.findDeleted({
    //   categoryId: _id,
    //   deleted: true,
    // });
    await category.restore();
    return res.status(201).json({
      category: category,
      message: "Khôi phục danh mục này thành công!",
    });
    // if (category.deleted && products.length >= 0) {
    //   // Sử dụng phương thức restore từ mongoose-delete để khôi phục danh mục
    //   await category.restore();
    //   for (const product of products) {
    //     await product.restore();
    //   }
    //   return res.status(201).json({
    //     category: category,
    //     message: "Khôi phục danh mục này thành công!",
    //   });
    // } else {
    //   return res
    //     .status(400)
    //     .json({ message: "Không thể khôi phục danh mục này" });
    // }
  } catch (error) {
    return res.status(500).json({ message: "Server error: " + error.message });
  }
};

export const forceDeleteCategory = async (req, res) => {
  try {
    const _id = req.params.id;
    const category = await Category.findOneDeleted({ _id });
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy danh mục này!",
      });
    }
    const result = await Category.deleteOne({ _id });
    const parentId = category.parent;
    const parentCategory = await Category.findById({
      _id: parentId,
    });
    if (parentCategory && parentCategory.subcategories.length > 0) {
      // return res.json(parentCategory);
      parentCategory.subcategories = parentCategory.subcategories.filter(
        (item) => {
          const itemObjectId = new ObjectId(item); // Chuyển đổi chuỗi thành ObjectId
          return !itemObjectId.equals(_id);
        }
      );
      await parentCategory.save();
    }
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy danh mục này!",
      });
    }
    // Xóa vĩnh viễn tất cả các sản phẩm có cùng categoryId
    // const productDelete = await Product.deleteMany({
    //   categoryId: _id,
    // });

    // return res.status(200).json({
    //   success: true,
    //   message: `Đã xóa vĩnh viễn danh mục và ${productDelete.deletedCount} sản phẩm liên quan.`,
    // });
    return res.status(200).json({
      success: true,
      message: `Đã xóa vĩnh viễn danh mục!`,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error: " + error.message });
  }
};


export const getAllDeletedCategories = async (req, res) => {
  const {
    _page = 1,
    _limit = 10,
    _sort = "createdAt",
    _order = "asc",
    _expand,
    parent = "",
  } = req.query;
  try {
    const skip = (_page - 1) * _limit; // Số bản ghi bỏ qua
    const sortOptions = {
      [_sort]: _order === "desc" ? -1 : 1,
    };
    const query = {};

    if (parent) query.parent = parent || "";
    if (_expand) query._expand = _expand || "";
    const categories = await Category.findDeleted(query)
      .populate([
        { path: "parent", select: "name" },
        { path: "subcategories", select: "name" },
      ])
      .sort(sortOptions)
      .skip(skip)
      .limit(_limit);
      const totalItems = await Category.countDeleted(query);
      const totalPages = Math.ceil(totalItems / _limit);
     if (!categories || categories.length === 0) {
       return res.status(203).json({
         message: "Không tìm thấy danh mục nào!",
         data: categories,
         pagination: {
           currentPage: +_page,
           totalPages: totalPages,
           totalItems: totalItems,
         },
       });
     }
    // Tính toán thông tin phân trang
    
    return  res.status(200).json({
      message: "Lấy danh mục thành công ",
      data:categories,
      pagination: {
        currentPage: +_page,
        totalPages: totalPages,
        totalItems: totalItems,
      },
    });
  } catch (error) {
     return res.status(500).json({
       success: false,
       message: "Category error server: " + error.message,
     });
  }
};

