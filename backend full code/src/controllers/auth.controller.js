const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const httpStatus = require("http-status");
const User = require("../models/user.model");
const config = require("../config/config");
const ApiError = require("../utils/ApiError");

// Thao tác với account

const login = async (req, res, next) => {
  const user = await User.findOne({ loginName: req.body.loginName });
  if (!user) {
    const err = new Error("Login name is not correct");
    err.statusCode = 400;
    return next(err);
  }
  if (bcrypt.compareSync(req.body.password, user.password)) {
    const token = jwt.sign({ userId: user._id, role: user.role }, config.jwt.secret);
    res.status(200).json({
      status: "success",
      data: {
        token,
        loginName: user.loginName,
        role: user.role,
      },
    });
  } else {
    const err = new Error("Password is not correct");
    err.statusCode = 400;
    return next(err);
  }
};
const getCurrentUser = async (req, res, next) => {
  console.log(req.user);
  if (req.user) {
    const user = await User.findById(req.user.userId);
    if (!user) {
      const err = new Error("Cannot find user!");
      err.statusCode = 404;
      return next(err);
    }
    res.status(200).json({
      status: "success",
      data: {
        loginName: user.loginName,
        role: user.role,
      },
    });
  } else {
    const err = new Error("Can not found user");
    err.statusCode = 404;
    return next(err);
  }
};
module.exports = {
  login,
  getCurrentUser,
};
