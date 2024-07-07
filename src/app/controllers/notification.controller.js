import notificationModel from "../models/notification.model";

export const getAllNotifications = async (req, res) => {
  const {
    _page = 1,
    _sort = "createdAt",
    _limit = 10,
    _order = "asc",
    _search,
  } = req.query;
  const options = {
    page: _page,
    sort: { [_sort]: _order === "desc" ? 1 : -1 },
    limit: _limit,
  };
  let query = {};
  if (_search) {
    query.$or = [];
    query.$or.push({
      user_name: { $regex: _search, $options: "i" },
      comment: { $regex: _search, $options: "i" },
    });
  }
  try {
    const notifications = await notificationModel.paginate(
      { ...query },
      {
        ...options,
        populate: [{ path: "user_id", select: "name phone image.url" }],
      }
    );

    if (!notifications || notifications?.docs?.length === 0) {
      return res.status(300).json({
        message: `Chưa có thông báo nào!`,
        notifications: notifications.docs,
        pagination: {
          currentPage: notifications.page,
          totalPages: notifications.totalPages,
          totalItems: notifications.totalDocs,
          limit: notifications.limit,
        },
      });
    }
    return res.status(200).json({
      message: `Lấy được danh sách thông báo thành công`,
      notifications: notifications.docs,
      pagination: {
        currentPage: notifications.page,
        totalPages: notifications.totalPages,
        totalItems: notifications.totalDocs,
        limit: notifications.limit,
      },
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Lỗi server",
    });
  }
};
export const getNotificationByUser = async (req, res) => {
  const {
    _userId = "",
    _page = 1,
    _sort = "createdAt",
    _limit = 10,
    _order = "asc",
  } = req.query;

  const options = {
    page: _page,
    sort: { [_sort]: _order === "desc" ? 1 : -1 },
    limit: _limit,
  };

  try {
    const notifications = await notificationModel.paginate(
      { user_id: _userId },
      { ...options, populate: [{ path: "user_id", select: "name phone" }] }
    );

    if (!notifications || notifications.docs.length === 0) {
      return res.status(200).json({
        message: `Chưa có thông báo nào!`,
        notifications: notifications.docs,
        pagination: {
          currentPage: notifications.page,
          totalPages: notifications.totalPages,
          totalItems: notifications.totalDocs,
          limit: notifications.limit,
        },
      });
    }
    return res.status(200).json({
      message: `Lấy được danh sách thông báo người dùng thành công`,
      notifications: notifications.docs,
      pagination: {
        currentPage: notifications.page,
        totalPages: notifications.totalPages,
        totalItems: notifications.totalDocs,
        limit: notifications.limit,
      },
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error server notification: " + error.message,
    });
  }
};

export const updateSeenStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedNotification = await notificationModel.findByIdAndUpdate(
      id,
      { seen_status: 1 },
      { new: true }
    );
    if (!updatedNotification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    return res.status(200).json(true);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
