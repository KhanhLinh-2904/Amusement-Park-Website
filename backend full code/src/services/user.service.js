const httpStatus = require("http-status");
const bcrypt = require("bcryptjs");
const { User, Vip } = require("../models");
const ApiError = require("../utils/ApiError");

const getAllUser = async () => User.find({});
const createUser = async userBody => {
  const user = await User.create(userBody);
  return user;
};

const getUserById = async id => {
  const user = await User.findById(id);
  return user;
};
const getUserByLoginName = async loginName => {
  User.findOne({ loginName });
};
const updateUserById = async (userId, updateBody) => {
  const user = await getUserById(userId);
  const updateContent = updateBody;
  if (!user) {
    throw new Error(httpStatus.NOT_FOUND, "User not found");
  }
  if (updateBody.password) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(updateBody.password, salt);
    updateContent.password = hash;
  }
  Object.assign(user, updateContent);
  await user.save();
  return user;
};
const deleteUserById = async userId => {
  const user = await getUserById(userId);
  if (!user) {
    throw new Error(httpStatus.NOT_FOUND, "User not found");
  }
  if (user.role === "admin") {
    throw new ApiError(httpStatus.FORBIDDEN, "Can not delete the admin account");
  }
  if (user.role === "customer") {
    const vip = await Vip.findOne({ phone: user.loginName });
    await vip.remove();
  }

  await user.remove();
  return user;
};
module.exports = {
  createUser,
  getAllUser,
  getUserById,
  getUserByLoginName,
  updateUserById,
  deleteUserById,
};
