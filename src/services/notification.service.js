"use strict";

import notificationModel from "../app/models/notification.model";
const newNotificationService = async ({ title, type, user, content, url }) => {
  const newNotification = await notificationModel.create({
    title,
    type,
    user,
    user_id: user._id,
    content,
    url,
  });
  return newNotification;
};
const getNotificationService = async ({ _id, seenStatus = 1 }) => {
  const otpUser = await notificationModel
    .findOneAndUpdate(_id, {
      seen_status: seenStatus,
    })
    .lean();
  return otpUser;
};

export { newNotificationService, getNotificationService };
