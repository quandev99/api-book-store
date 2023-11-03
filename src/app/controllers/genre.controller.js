import GenreModel from "../models/genre.model";

export const createGenre = async (req, res) => {
  const { name } = req.body;
  try {
    const genre = await GenreModel.findOne({
      name,
    });
    if (genre)
      return res.status(400).json({
        success: false,
        message: "Tên thể loại đã tồn tại: ",
      });
    const newGenre = await GenreModel.create(req.body);
    if (!newGenre)
      return res.status(401).json({
        success: false,
        message: "Thêm mới thể loại thất bại!",
      });
    return res.status(200).json({
      success: true,
      message: "Thêm mới thể loại thành công!",
      genre: newGenre,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Genre error server: " + error.message,
    });
  }
};

export const getAllGenres = async (req, res) => {
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
    const genres = await GenreModel.paginate(query, option);
    if (!genres.docs || genres.docs.length === 0) {
      return res.status(204).json({
        success: false,
        message: "không tìm thấy thể loại sách nào!",
        genres: genres.docs,
        pagination: {
          currentPage: genres.page,
          totalPages: genres.totalPages,
          totalItems: genres.totalDocs,
        },
      });
    }
    res.status(200).json({
      success: true,
      message: "Danh sách thể loại sách!",
      genres: genres.docs,
      pagination: {
        currentPage: genres.page,
        totalPages: genres.totalPages,
        totalItems: genres.totalDocs,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Genres error server: " + error.message,
    });
  }
};

export const updateGenre = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const genre = await GenreModel.findOne({ _id: { $ne: id }, name });
    if (genre)
      return res.status(400).json({
        success: false,
        message: "Thể loại sách không tồn tại!",
      });
    const updateGenre = await GenreModel.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true }
    );
    if (!updateGenre)
      return res.status(401).json({
        success: false,
        message: "Cập nhật Thể loại sách thất bại!",
      });
    return res.status(200).json({
      success: true,
      message: "Cập nhật Thể loại sách thành công!",
      genre: updateGenre,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Genre error server: " + error.message,
    });
  }
};
export const getGenreById = async (req, res) => {
  const { id } = req.params;
  try {
    const gender = await GenreModel.findById(id);
    if (!gender)
      return res.status(400).json({
        success: false,
        message: "Thể loại sách không tồn tại!",
      });
    return res.status(200).json({
      success: true,
      message: "Lấy thành công thể loại sách!",
      gender,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gender error server: " + error.message,
    });
  }
};

export const deleteGenre = async (req, res) => {
  const { id } = req.params;
  try {
    const genre = await GenreModel.findById(id);
    if (!genre)
      return res.status(400).json({
        success: false,
        message: "Thể loại sách không tồn tại!",
      });
    await genre.delete();
    return res
      .status(200)
      .json({ genre, message: "Xóa mềm thể loại sách thành công!" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Genre error server: " + error.message,
    });
  }
};

export const restoreGenre = async (req, res) => {
  try {
    const _id = req.params.id;
    const genre = await GenreModel.findOneDeleted({ _id });

    if (!genre) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thể loại sách!",
      });
    }
    await genre.restore();
    return res.status(200).json({
      genre,
      message: "Khôi phục thể loại sách thành công!",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Genre error server: " + error.message,
    });
  }
};

export const forceDeleteGenre = async (req, res) => {
  try {
    const _id = req.params.id;
    const genre = await GenreModel.findOneDeleted({ _id });
    if (!genre) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thể loại sách này!",
      });
    }
    const result = await GenreModel.deleteOne({ _id });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Xóa thể loại sách không thành công!",
      });
    }
    return res.status(200).json({
      success: true,
      message: `Đã xóa vĩnh viễn thể loại sách!`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Genre error server: " + error.message,
    });
  }
};

export const getAllDeleteGenres = async (req, res) => {
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
    const genres = await GenreModel.findDeleted(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(_limit);
    // Tính toán thông tin phân trang
    const totalItems = await GenreModel.countDeleted(query);
    const totalPages = Math.ceil(totalItems / _limit);
    if (!genres || genres.length === 0) {
      return res.status(204).json({
        success: false,
        message: "Danh sách thể loại sách trống!",
        genres,
        pagination: {
          currentPage: +_page,
          totalPages: totalPages,
          totalItems: totalItems,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách thể loại sách thành công",
      genres,
      pagination: {
        currentPage: +_page,
        totalPages: totalPages,
        totalItems: totalItems,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Genre error server: " + error.message,
    });
  }
};
