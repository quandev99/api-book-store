import apiKeyModel from "../app/models/apiKey.model";
export const findById = async (key) => {
  const objectKey = await apiKeyModel.findOne({ key,status:true }).lean();
  return objectKey
}

