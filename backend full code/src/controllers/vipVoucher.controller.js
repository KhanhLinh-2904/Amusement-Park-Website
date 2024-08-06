const voucherCodes = require("voucher-code-generator");
const { VipVoucher, Vip } = require("../models");

const getVipVoucher = async (req, res, next) => {
  let vipVoucher;
  if (req.body.vipId) {
    vipVoucher = await VipVoucher.find({ vipId: req.body.vipId, isUsed: false });
  } else vipVoucher = [];
  res.json(vipVoucher);
};
const createVipVoucher = async (req, res, next) => {
  if (!req.body.discount || !req.body.vipId) {
    const err = new Error("Lack of field");
    err.statusCode = 400;
    return next(err);
  }
  const { discount, vipId } = req.body;
  const vip = await Vip.findById(vipId);
  const dateEnd = Date.now() + 7 * 24 * 60 * 60 * 1000;
  if (discount > 10 || discount < 0) {
    const err = new Error("Not valid discount");
    err.statusCode = 400;
    return next(err);
  }
  if (vip.point < discount * 10000) {
    const err = new Error("Not have enough point");
    err.statusCode = 400;
    return next(err);
  }
  const code = voucherCodes.generate({
    length: 5,
    charset: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
  })[0];
  const vipVoucher = await VipVoucher.create({ ...req.body, dateEnd, voucherCode: code });
  vip.point -= discount * 10000;
  await vip.save();
  res.json(vipVoucher);
};
module.exports = { getVipVoucher, createVipVoucher };
