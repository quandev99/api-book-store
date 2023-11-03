import AuthorModel from "../models/author.model";

export const createAuthor = async (req, res) => {
  const { name } = req.body;
  try {
    const author = await AuthorModel.findOne({
      name,
    });
    if (author)
      return res.status(400).json({
        success: false,
        message: "Tên tác giả đã tồn tại: ",
      });
    const newAuthor = await AuthorModel.create(req.body);
    if (!newAuthor)
      return res.status(401).json({
        success: false,
        message: "Thêm mới tác giả thất bại!",
      });
    return res.status(200).json({
      success: true,
      message: "Thêm mới tác giả thành công!",
      author: newAuthor,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Author error server: " + error.message,
    });
  }
};

export const getAllAuthors = async (req, res) => {
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
    const authors = await AuthorModel.paginate(query, option);
    if (!authors.docs || authors.docs.length === 0) {
      return res.status(204).json({
        success: false,
        message: "Danh sách tác giả trống!",
        authors: authors.docs,
        pagination: {
          currentPage: authors.page,
          totalPages: authors.totalPages,
          totalItems: authors.totalDocs,
        },
      });
    }
    res.status(200).json({
      success: true,
      message: "Danh sách tác giả !",
      authors: authors.docs,
      pagination: {
        currentPage: authors.page,
        totalPages: authors.totalPages,
        totalItems: authors.totalDocs,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Publisher error server: " + error.message,
    });
  }
};

export const updateAuthor = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const author = await AuthorModel.findOne({ _id: { $ne: id }, name });
    if (author)
      return res.status(400).json({
        success: false,
        message: "tác giả không tồn tại!",
      });
    const updateAuthor = await AuthorModel.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true }
    );
    if (!updateAuthor)
      return res.status(401).json({
        success: false,
        message: "Cập nhật tác giả thất bại!",
      });
    return res.status(200).json({
      success: true,
      message: "Cập nhật tác giả thành công!",
      author: updateAuthor,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Publisher error server: " + error.message,
    });
  }
};
export const getAuthorById = async (req, res) => {
  const { id } = req.params;
  try {
    const author = await AuthorModel.findById(id);
    if (!author)
      return res.status(400).json({
        success: false,
        message: "Tác giả không tồn tại!",
      });
    return res.status(200).json({
      success: true,
      message: "Lấy thành công tác giả!",
      author,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Author error server: " + error.message,
    });
  }
};

export const deleteAuthor = async (req, res) => {
  const { id } = req.params;
  try {
    const author = await AuthorModel.findById(id);
    if (!author)
      return res.status(400).json({
        success: false,
        message: "Tác giả không tồn tại!",
      });
    await author.delete();
    return res
      .status(200)
      .json({ author, message: "Xóa mềm tác giả thành công!" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Author error server: " + error.message,
    });
  }
};

export const restoreAuthor = async (req, res) => {
  try {
    const _id = req.params.id;
    const author = await AuthorModel.findOneDeleted({ _id });

    if (!author) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tác giả!",
      });
    }

    await author.restore();
    return res.status(200).json({
      author,
      message: "Khôi phục tác giả thành công!",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Author error server: " + error.message,
    });
  }
};

export const forceDeleteAuthor = async (req, res) => {
  try {
    const _id = req.params.id;
    const author = await AuthorModel.findOneDeleted({ _id });
    if (!author) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tác giả này!",
      });
    }
    const result = await AuthorModel.deleteOne({ _id });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tác giả này!",
      });
    }
    return res.status(200).json({
      success: true,
      message: `Đã xóa vĩnh viễn tác giả!`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Author error server: " + error.message,
    });
  }
};

export const getAllDeleteAuthor = async (req, res) => {
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
    // Điều kiện tìm kiếm tác giả đã bị xóa mềm (deleted: true)
    const query = {};

    // Nếu có yêu cầu mở rộng (_expand), thêm điều kiện tìm kiếm theo tên
    if (_expand) {
      query.name = _expand || "";
    }
    const authors = await AuthorModel.findDeleted(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(_limit);
    // Tính toán thông tin phân trang
    const totalItems = await AuthorModel.countDeleted(query);
    const totalPages = Math.ceil(totalItems / _limit);
    if (!authors || authors.length === 0) {
      return res.status(204).json({
        success: false,
        message: "Danh sách tác giả trống!",
        authors,
        pagination: {
          currentPage: +_page,
          totalPages: totalPages,
          totalItems: totalItems,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách tác giả thành công",
      authors,
      pagination: {
        currentPage: +_page,
        totalPages: totalPages,
        totalItems: totalItems,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Author error server: " + error.message,
    });
  }
};
