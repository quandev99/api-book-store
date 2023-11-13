import userModel from "../app/models/user.model";

export const findByAuth = async (info) => {
  const auThor = await userModel.findOne(info).lean();
  return auThor;
};
