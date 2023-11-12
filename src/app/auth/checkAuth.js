import { findById } from "../../services/apiKey.service";

const HEADER = {
  API_KEY :'x-api-key',
  AUTHORIZATION_KEY :'authorization',
}

export const apiKey = async (req,res,next)=>{
  try {
    const key = req.headers[HEADER?.API_KEY]?.toString();
    if(!key) return res.status(403).json({message:"Forbidden error 1"});

    const objectKey = await findById(key);
    if(!objectKey) return res.status(403).json({ message: "Forbidden error 2" });
    req.objectKey = objectKey;
    return next()
  } catch (error) {
    
  }
}

export const permissions = (permission) => {
  return (req, res, next) => {
    if (!req.objectKey.permissions)
      return res.status(403).json({ message: "Permissions denied 1" });
    const validPermissions = req.objectKey.permissions.includes(permission);
    if (!validPermissions)
      return res.status(403).json({ message: "Permissions denied 2" });

    return next();
  };
};