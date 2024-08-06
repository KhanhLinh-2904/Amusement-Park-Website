const { Constant } = require("../models");

const getConstant = async (req, res, next) => {
  const constant = Constant.findOne({});
  return constant;
};
module.exports = {
  getConstant,
};
