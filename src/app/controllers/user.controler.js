import UserModel from "../models/user.model";

import dotenv from "dotenv";
import { KeyTokenService } from "../../services/keyToken.service";
import { CREATED, OK, SuccessResponse } from "../../core/success.response";
import {
  AuthFailureError,
  BAD_REQUEST,
  ConflictResponse,
  ForBiddenError,
} from "../../core/errors.response";
import { verifyJWT } from "../auth/authUtils";
import { findByAuth } from "../../services/author.service";
dotenv.config();


export const getAllUsers = async (req, res, next) => {
  const {
    _page = 1,
    _limit = 10,
    _sort = "createdAt",
    _order = "asc",
    _search,
  } = req.query;
  const option = {
    page: _page,
    limit: _limit,
    sort: {
      [_sort]: _order === "desc" ? -1 : 1,
    },
  };
  let query = {};
  if (_search) {
     query.$and = [];
     query.$and.push({
       name: { $regex: _search, $options: "i" },
     });
  }
  try {
    const users = await UserModel.paginate(query, {
      ...option,
      // populate: [{ path: "bill_details" }],
    });
    if (!users.docs || users.docs.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Danh sách users trống!",
        users: users.docs,
        pagination: {
          currentPage: users.page,
          totalPages: users.totalPages,
          totalItems: users.totalDocs,
        },
      });
    }
    res.status(200).json({
      success: true,
      message: "Danh sách tác giả !",
      users: users.docs,
      pagination: {
        currentPage: users.page,
        totalPages: users.totalPages,
        totalItems: users.totalDocs,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "USer error server: " + error.message,
    });
  }
}

export const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await UserModel.findById(id);
    if (!user)
      throw new BAD_REQUEST("Người dùng không tồn tại!");
    return res.status(200).json({
      success: true,
      message: "Lấy thành công người dùng!",
      user,
    });
  } catch (error) {
    return res.status(error?.status || 500).json({
      success: false,
      message: "User error server: " + error.message,
    });
  }
};
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const user = await UserModel.findOne({ _id: { $ne: id }, name});
    if (user)
      throw new BAD_REQUEST("Người dùng không tồn tại!");
    const updateUser = await UserModel.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true }
    );
    if (!updateUser)
      return res.status(401).json({
        success: false,
        message: "Cập nhật người dùng thất bại!",
      });
    return res.status(200).json({
      success: true,
      message: "Cập nhật người dùng thành công!",
      supplier: updateUser,
    });
  } catch (error) {
    return res.status(error?.status || 500).json({
      success: false,
      message: "Supplier error server: " + error.message,
    });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await UserModel.findById(id);
    if (!user)
      throw new BAD_REQUEST("Người dùng không tồn tại!");
    if(user.cart_id !== null){
      throw new BAD_REQUEST("Tài khoản đang còn ràng buộc!!");
    }
      await user.delete();
    return res
      .status(200)
      .json({ user, message: "Xóa mềm tài khoản thành công!" });
  } catch (error) {
    return res.status(error?.status || 500).json({
      success: false,
      message: "User error server: " + error.message,
    });
  }
};

export const restoreUser = async (req, res) => {
  try {
    const _id = req.params.id;
    const user = await UserModel.findOneDeleted({ _id });

    if (!user) {
       throw new BAD_REQUEST("Người dùng không tồn tại!");
    }

    await user.restore();
    return res.status(200).json({
      user,
      message: "Khôi phục người dùng thành công!",
    });
  } catch (error) {
    return res.status(+error?.status || 500).json({
      success: false,
      message: "User error server: " + error.message,
    });
  }
};

export const forceDeleteUser = async (req, res) => {
  try {
    const _id = req.params.id;
    const user = await UserModel.findOneDeleted({ _id });
    if (!user) {
      throw new BAD_REQUEST("Người dùng không tồn tại!");
    }
    const result = await UserModel.deleteOne({ _id });

    if (result.deletedCount === 0) {
      throw new BAD_REQUEST("Không xóa người dùng thành công!");
    }
    return res.status(200).json({
      success: true,
      message: `Đã xóa vĩnh viễn tài khoản!`,
    });
  } catch (error) {
    return res.status(+error?.status || 500).json({
      success: false,
      message: "User error server: " + error.message,
    });
  }
};

export const getAllDeleteUser = async (req, res) => {
  const {
    _page = 1,
    _limit = 10,
    _sort = "createdAt",
    _order = "asc",
    _search,
  } = req.query;

  try {
    const skip = (_page - 1) * _limit;
    const sortOptions = {
      [_sort]: _order === "desc" ? -1 : 1,
    };
    const query = {};
    if (_search) {
      query.$and = [];
      query.$and.push({
        name: { $regex: _search, $options: "i" },
      });
    }
    const users = await UserModel.findDeleted(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(_limit);
    // Tính toán thông tin phân trang
    const totalItems = await UserModel.countDeleted(query);
    const totalPages = Math.ceil(totalItems / _limit);
    if (!users || users.length === 0) {
      return res.status(204).json({
        success: false,
        message: "Danh sách tài khoản trống!",
        users,
        pagination: {
          currentPage: +_page,
          totalPages: totalPages,
          totalItems: totalItems,
        },
      });
    }
    return res.status(200).json({
      success: true,
      message: "Lấy danh sách tài khoản thành công",
      users,
      pagination: {
        currentPage: +_page,
        totalPages: totalPages,
        totalItems: totalItems,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User error server: " + error.message,
    });
  }
};
