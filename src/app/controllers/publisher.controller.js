import PublisherModel from "../models/publisher.model";

export  const createPublisher = async (req,res)=>{
  const { name, phone_number } = req.body;
  try {
    const publisher = await PublisherModel.findOne(
      {
        name,
      },
    );
    const phoneNumberExisting = await PublisherModel.findOne({
      phone_number,
    });
    if(publisher) return res.status(400).json({
      success: false,
      message: "Tên đã tồn tại: ",
    });
    if (phoneNumberExisting)
      return res.status(400).json({
        success: false,
        message: "Số điện thoại đã tồn tại: ",
      });

    const newPublisher = await PublisherModel.create(req.body)
    if(!newPublisher) return res.status(401).json({
      success: false,
      message: "Thêm mới nhà xuất bản thất bại!",
    });
    return res.status(200).json({
      success: true,
      message: "Thêm mới nhà xuất bản thành công!",
      publisher:newPublisher,
    });
  } catch (error) {
   return res.status(500).json({
     success: false,
     message: "Publisher error server: " + error.message,
   });
  }
}

export const getAllPublishers = async (req, res) => {
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
  let query = { };
  if(_expand) {
   query.name = _expand || ""; 
  }
  try {
    const publishers = await PublisherModel.paginate(query, option)
    if (!publishers.docs || publishers.docs.length === 0) {
      return res.status(204).json({
        success: false,
        message: "không tìm thấy nhà xuất bản nào!",
        publishers: publishers.docs,
        pagination: {
          currentPage: publishers.page,
          totalPages: publishers.totalPages,
          totalItems: publishers.totalDocs,
        },
      });
    }
    res.status(200).json({
      success: true,
      message: "Lấy nhà xuất bản thành công ",
      publishers: publishers.docs,
      pagination: {
        currentPage: publishers.page,
        totalPages: publishers.totalPages,
        totalItems: publishers.totalDocs,
      },
    });
  } catch (error) {
   return res.status(500).json({
     success: false,
     message: "Publisher error server: " + error.message,
   });
  }
};

export  const updatePublisher = async (req,res)=>{
  const {id}= req.params
  const {name}= req.body
  try {
    const publisher = await PublisherModel.findOne({ _id: { $ne: id }, name });
    if(publisher) return res.status(400).json({
      success: false,
      message: "Tên nhà xuất bản đã tồn tại: " + name,
    });
    const updatePublisher = await PublisherModel.findByIdAndUpdate(id,{...req.body},{new:true})
    if(!updatePublisher) return res.status(401).json({
      success: false,
      message: "Cập nhật nhà xuất bản thất bại!",
    });
    return res.status(200).json({
      success: true,
      message: "Cập nhật nhà xuất bản thành công!",
      publisher:updatePublisher,
    });
  } catch (error) {
   return res.status(500).json({
     success: false,
     message: "Publisher error server: " + error.message,
   });
  }
}
export  const getPublisherById = async (req, res) => {
  const { id } = req.params;
  try {
    const publisher = await PublisherModel.findById(
      id,
    );
    if (!publisher)
      return res.status(400).json({
        success: false,
        message: "Nhà xuất bản đã không tồn tại!",
      });
    return res.status(200).json({
      success: true,
      message: "Nhà xuất bản!",
      publisher
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Publisher error server: " + error.message,
    });
  }
};

export const deletePublisher = async (req, res) => {
    const { id } = req.params;
  try {
     const publisher = await PublisherModel.findById(id);
     if (!publisher)
       return res.status(400).json({
         success: false,
         message: "Nhà xuất bản đã không tồn tại!",
       });
    await publisher.delete();
    return res
      .status(200)
      .json({ publisher, message: "Xóa mềm nhà xuất bản thành công!" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Publisher error server: " + error.message,
    });
  }
};

export const restorePublisher = async (req, res) => {
  try {
    const _id = req.params.id;
    const publisher = await PublisherModel.findOneDeleted({ _id });

    if (!publisher) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy nhà xuất bản!",
      });
    }

    await publisher.restore();
    return res.status(200).json({
      publisher,
      message: "Khôi phục nhà xuất bản thành công!",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Publisher error server: " + error.message,
    });
  }
};

export const forceDeletePublisher = async (req, res) => {
  try {
    const _id = req.params.id;
    const publisher = await PublisherModel.findOneDeleted({ _id });
    if (!publisher) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy nhà xuất bản này!",
      });
    }
    const result = await PublisherModel.deleteOne({ _id });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy nhà xuất bản này!",
      });
    }
    return res.status(200).json({
      success: true,
      message: `Đã xóa vĩnh viễn nhà xuất bản!`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Publisher error server: " + error.message,
    });
  }
};


export const getAllDeletePublisher = async (req, res) => {
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
    // Điều kiện tìm kiếm nhà xuất bản đã bị xóa mềm (deleted: true)
    const query = {};

    // Nếu có yêu cầu mở rộng (_expand), thêm điều kiện tìm kiếm theo tên
    if (_expand) {
      query.name = _expand || "";
    }
    const publishers = await PublisherModel.findDeleted(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(_limit);
    // Tính toán thông tin phân trang
    const totalItems = await PublisherModel.countDeleted(query);
    const totalPages = Math.ceil(totalItems / _limit);
    if (!publishers || publishers.length === 0) {
      return res.status(204).json({
        success: false,
        message: "Không tìm thấy nhà xuất bản nào!",
        publishers,
        pagination: {
          currentPage: +_page,
          totalPages: totalPages,
          totalItems: totalItems,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lấy nhà xuất bản thành công",
      publishers,
      pagination: {
        currentPage: +_page,
        totalPages: totalPages,
        totalItems: totalItems,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Publisher error server: " + error.message,
    });
  }
};