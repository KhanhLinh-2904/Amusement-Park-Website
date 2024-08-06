const { v4: uuidv4 } = require("uuid");
const voucherCodes = require("voucher-code-generator");
const bcrypt = require("bcryptjs");
const QRCode = require("qrcode");
const httpStatus = require("http-status");
const { emailService } = require("../services");
const { Vip, User } = require("../models");
const { crudService } = require("../services");
const cloudinary = require("../utils/cloudinary");

const getAllVip = async (req, res, next) => {
  const vips = await Vip.aggregate([
    {
      $addFields: { status: { $gt: ["$dateEnd", "$$NOW"] } },
    },
  ]);
  res.json(vips);
};
const getVipById = async (req, res, next) => {
  if (!req.params.uuid) {
    const err = new Error("No uuid is provide!");
    err.statusCode = 400;
    return next(err);
  }
  const vip = await Vip.findById(req.params.uuid);
  if (!vip) {
    const err = new Error("Vip Not found!");
    err.statusCode = 404;
    return next(err);
  }
  res.json(vip);
};
const getVipByCode = async (req, res, next) => {
  if (!req.params.code) {
    const err = new Error("No uuid is provide!");
    err.statusCode = 400;
    return next(err);
  }
  const vip = await Vip.findOne({ vipCode: req.params.code });
  if (!vip) {
    const err = new Error("Vip Not found!");
    err.statusCode = 404;
    return next(err);
  }
  res.json(vip);
};
const getVipbyPhone = async (req, res, next) => {
  if (!req.body.phone) {
    const err = new Error("Lacks of field");
    err.statusCode = 404;
    return next(err);
  }
  const vip = await Vip.findOne({ phone: req.body.phone });
  res.json(vip);
};
const createVip = async (req, res, next) => {
  try {
    if (!req.body.email || !req.body.phone || !req.body.name) {
      const err = new Error("Lack of field");
      err.statusCode = 404;
      return next(err);
    }
    const _id = uuidv4();
    console.log(_id);
    const qrCode = await QRCode.toDataURL(_id);
    const qr_result = await cloudinary.uploader.upload(qrCode);
    if (!qr_result) {
      const err = new Error("Can not upload image");
      err.statusCode = 400;
      return next(err);
    }
    const vipCode = voucherCodes.generate({
      length: 5,
      charset: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890",
    })[0];
    const dateEnd = Date.now() + 365 * 24 * 60 * 60 * 1000;
    const randomPassWord = voucherCodes.generate({
      length: 8,
      charset: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890",
    })[0];
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(randomPassWord, salt);
    const user = await User.create({ loginName: req.body.phone, password: hash, role: "customer" });
    const vip = await Vip.create({
      ...req.body,
      _id,
      vipCode,
      dateEnd,
      qrImage: { url: qr_result.secure_url, cloudinary_id: qr_result.public_id },
      userId: user._id,
    });

    const data = { to: req.body.email, subject: "Here is your VIP information" };
    await emailService.sendEjsMail({
      template: "mailinfovip",
      templateVars: { code: vipCode, qr: qr_result.secure_url, name: req.body.name, password: randomPassWord },
      ...data,
    });

    res.json(vip);
  } catch (err) {
    const error = new Error("Can not create vip because duplicate phone");
    error.statusCode = 400;
    return next(error);
  }
};
const updateVip = async (req, res, next) => {
  if (req.body.name && req.body.email && req.body.phone && !req.body.code && !req.body.uuid) {
    const { name, email, phone } = req.body;
    const vip = await Vip.findOne({ name, email, phone });
    if (!vip || !vip.email) {
      const err = new Error("Cannot found!");
      err.statusCode = 404;
      return next(err);
    }
    if (req.body.password) {
      const randomPassWord = voucherCodes.generate({
        length: 8,
        charset: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890",
      })[0];
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(randomPassWord, salt);
      const user = await User.findById(vip.userId);
      user.password = hash;
      const data = { to: vip.email, subject: "Here is your VIP information" };
      await user.save();
      await emailService.sendEjsMail({
        template: "mailinfovip",
        templateVars: { code: vip.vipCode, qr: vip.qrImage.url, name: req.body.name, password: randomPassWord },
        ...data,
      });
      return res.json(vip);
    }
    const data = { to: vip.email, subject: "Here is your VIP information" };
    await emailService.sendEjsMail({
      template: "mailinfovip",
      templateVars: { code: vip.vipCode, qr: vip.qrImage.url, name: req.body.name, password: "..." },
      ...data,
    });
    res.json(vip);
  } else if (req.body.code || req.body.uuid) {
    let vip;
    if (req.body.code) {
      vip = await Vip.findOne({ vipCode: req.body.code });
    } else vip = await Vip.findById(req.body.uuid);
    if (!vip) {
      const err = new Error("Cannot found!");
      err.statusCode = 404;
      return next(err);
    }
    let updateBody;
    if (req.body.extend) {
      const dateEnd = new Date(vip.dateEnd).getTime() + 365 * 24 * 60 * 60 * 1000;
      updateBody = { dateEnd };
      Object.assign(vip, updateBody);
      await vip.save();
    } else {
      updateBody = { name: req.body.name, email: req.body.email, phone: req.body.phone };

      Object.assign(vip, updateBody);
      const vipUser = await User.findById(vip.userId);
      vipUser.loginName = req.body.phone;
      Promise.all([vipUser.save(), vip.save()]);
    }
    res.status(200).json(vip);
  }
};
const deleteVip = async (req, res, next) => {
  if (!req.body.listUuid) {
    const err = new Error("Lack of field");
    err.statusCode = 404;
    return next(err);
  }
  const vips = await Vip.find({ _id: { $in: req.body.listUuid } });
  console.log(vips);
  if (!vips || vips.length === 0) {
    const err = new Error("Cannot found!");
    err.statusCode = 404;
    return next(err);
  }
  const list_id = [];
  for (const vip of vips) {
    if (vip) {
      cloudinary.uploader.destroy(vip.qrImage.cloudinary_id);
      list_id.push(vip.userId);
    }
  }
  await Promise.all([Vip.deleteMany({ _id: { $in: req.body.listUuid } }), User.deleteMany({ _id: { $in: list_id } })]);
  res.status(200).send("Delete Successfully");
};

module.exports = {
  getAllVip,
  createVip,
  updateVip,
  deleteVip,
  getVipbyPhone,
  getVipById,
  getVipByCode,
};
