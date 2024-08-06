const { Constant } = require("../models");
const { constantService } = require("../services");

const getAllConstant = async (req, res, next) => {
  const constant = await constantService.getConstant();
  res.send(constant);
};
const updateConstant = async (req, res, next) => {
  try {
    const constantId = "627f2abfeede88ddb789086f";
    const constant = await Constant.findByIdAndUpdate(constantId, { ...req.body }, { new: true, runValidator: true });
    res.status(200).json({
      constant,
    });
  } catch (error) {
    next(error);
  }
};
module.exports = {
  getAllConstant,
  updateConstant,
};
