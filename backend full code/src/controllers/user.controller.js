const httpStatus = require("http-status");
const bcrypt = require("bcryptjs");
const cloudinary = require("cloudinary").v2;
const { userService } = require("../services");
const ApiError = require("../utils/ApiError");
const User = require("../models/user.model");

const createUser = async (req, res, next) => {
  try {
    if (req.body.password.length < 8) {
      throw new ApiError(400, "Password must be at least 8 characters");
    } else if (req.body.loginName.length < 6) {
      throw new ApiError(400, "Login name must be at least 6 characters");
    }
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(req.body.password, salt);
    const user = await User.create({ ...req.body, password: hash });

    res.status(200).json({
      status: "success",
      data: {
        loginName: user.loginName,
        id: user._id,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const getUser = async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new Error(httpStatus.NOT_FOUND, "User not found");
  }
  res.send(user);
};
const getUsers = async (req, res) => {
  const users = await userService.getAllUser();

  res.status(200).send(users);
};
const updateUser = async (req, res) => {
  const user = await userService.updateUserById(req.params.userId, req.body);
  res.send(user);
};

const deleteUser = async (req, res) => {
  await userService.deleteUserById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
};
const updateProfile = async (req, res, next) => {
  let updateBody = { ...req.body };
  const user = await User.findById(req.user.userId);
  if (!user) {
    const err = new Error("Can not find this user");
    err.statusCode = 404;
    return next(err);
  }

  let result = {};
  if (req.file) {
    if (user.profile.image) {
      if (user.profile.image.cloudinary_id) await cloudinary.uploader.destroy(user.profile.image.cloudinary_id);
    }
    result = await cloudinary.uploader.upload(req.file.path);
    if (!result) {
      const err = new Error("Can not upload avatar");
      err.statusCode = 400;
      return next(err);
    }
  }

  updateBody = {
    ...req.body,
    image: {
      url: result.secure_url ? result.secure_url : user.profile.image.url,
      cloudinary_id: result.public_id ? result.public_id : user.image.profile.cloudinary_id,
    },
  };
  Object.assign(user.profile, updateBody);
  await user.save();
  res.status(200).json({
    user,
  });
};

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  updateProfile,
};
