import SupplierModel from "../models/supplier.model";

export const createSupplier = async (req, res) => {
  const { name } = req.body;
  try {
    const supplier = await SupplierModel.findOne({
      name,
    });
    if (supplier)
      return res.status(400).json({
        success: false,
        message: "Tên nhà cung cấp đã tồn tại: ",
      });
    const newSupplier = await SupplierModel.create(req.body);
    if (!newSupplier)
      return res.status(401).json({
        success: false,
        message: "Thêm mới nhà cung cấp thất bại!",
      });
    return res.status(200).json({
      success: true,
      message: "Thêm mới nhà cung cấp thành công!",
      supplier: newSupplier,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Supplier error server: " + error.message,
    });
  }
};

export const getAllSuppliers = async (req, res) => {
  const {
    _page = 1,
    _limit = 10,
    _sort = "createdAt",
    _order = "asc",
    _expand,
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
  try {
    const suppliers = await SupplierModel.paginate(query, option);
    if (!suppliers.docs || suppliers.docs.length === 0) {
      return res.status(400).json({
        success: false,
        message: "không tìm thấy nhà cung cấp nào!",
        suppliers: suppliers.docs,
        pagination: {
          currentPage: suppliers.page,
          totalPages: suppliers.totalPages,
          totalItems: suppliers.totalDocs,
        },
      });
    }
    res.status(200).json({
      success: true,
      message: "Danh sách nhà cung cấp !",
      suppliers: suppliers.docs,
      pagination: {
        currentPage: suppliers.page,
        totalPages: suppliers.totalPages,
        totalItems: suppliers.totalDocs,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Suppliers error server: " + error.message,
    });
  }
};

export const updateSupplier = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const supplier = await SupplierModel.findOne({ _id: { $ne: id }, name });
    if (supplier)
      return res.status(400).json({
        success: false,
        message: "nhà cung cấp không tồn tại!",
      });
    const updateSupplier = await SupplierModel.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true }
    );
    if (!updateSupplier)
      return res.status(401).json({
        success: false,
        message: "Cập nhật nhà cung cấp thất bại!",
      });
    return res.status(200).json({
      success: true,
      message: "Cập nhật nhà cung cấp thành công!",
      supplier: updateSupplier,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Supplier error server: " + error.message,
    });
  }
};
export const getSupplierById = async (req, res) => {
  const { id } = req.params;
  try {
    const supplier = await SupplierModel.findById(id);
    if (!supplier)
      return res.status(400).json({
        success: false,
        message: "nhà cung cấp không tồn tại!",
      });
    return res.status(200).json({
      success: true,
      message: "Lấy thành công nhà cung cấp!",
      supplier,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Supplier error server: " + error.message,
    });
  }
};

export const deleteSupplier = async (req, res) => {
  const { id } = req.params;
  try {
    const supplier = await SupplierModel.findById(id);
    if (!supplier)
      return res.status(400).json({
        success: false,
        message: "Nhà cung cấp không tồn tại!",
      });
    await supplier.delete();
    return res
      .status(200)
      .json({ supplier, message: "Xóa mềm nhà cung cấp thành công!" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Supplier error server: " + error.message,
    });
  }
};

export const restoreSupplier = async (req, res) => {
  try {
    const _id = req.params.id;
    const supplier = await SupplierModel.findOneDeleted({ _id });

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy nhà cung cấp!",
      });
    }

    await supplier.restore();
    return res.status(200).json({
      supplier,
      message: "Khôi phục nhà cung cấp thành công!",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Supplier error server: " + error.message,
    });
  }
};

export const forceDeleteSupplier = async (req, res) => {
  try {
    const _id = req.params.id;
    const supplier = await SupplierModel.findOneDeleted({ _id });
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy nhà cung cấp này!",
      });
    }
    const result = await SupplierModel.deleteOne({ _id });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy nhà cung cấp này!",
      });
    }
    return res.status(200).json({
      success: true,
      message: `Đã xóa vĩnh viễn nhà cung cấp!`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Supplier error server: " + error.message,
    });
  }
};

export const getAllDeleteSupplier = async (req, res) => {
  const {
    _page = 1,
    _limit = 10,
    _sort = "createdAt",
    _order = "asc",
    _expand,
  } = req.query;

  try {
    const skip = (_page - 1) * _limit; // Số bản ghi bỏ qua
    const sortOptions = {
      [_sort]: _order === "desc" ? -1 : 1,
    };
    const query = {};
    // Nếu có yêu cầu mở rộng (_expand), thêm điều kiện tìm kiếm theo tên
    if (_expand) {
      query.name = _expand || "";
    }
    const suppliers = await SupplierModel.findDeleted(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(_limit);
    // Tính toán thông tin phân trang
    const totalItems = await SupplierModel.countDeleted(query);
    const totalPages = Math.ceil(totalItems / _limit);
    if (!suppliers || suppliers.length === 0) {
      return res.status(204).json({
        success: false,
        message: "Danh sách nhà cung cấp trống!",
        suppliers,
        pagination: {
          currentPage: +_page,
          totalPages: totalPages,
          totalItems: totalItems,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách nhà cung cấp thành công",
      suppliers,
      pagination: {
        currentPage: +_page,
        totalPages: totalPages,
        totalItems: totalItems,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Supplier error server: " + error.message,
    });
  }
};
