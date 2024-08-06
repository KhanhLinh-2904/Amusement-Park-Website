const httpStatus = require("http-status");
const { default: mongoose } = require("mongoose");
const { Maintainance } = require("../models");
const cloudinary = require("../utils/cloudinary");

const getMaintainance = async (req, res, next) => {
  let { listId, listStatus, sort, search } = req.query;
  const { start, end, page, limit, type } = req.query;
  if (listId) {
    if (listId.length === 0) listId = null;
    listId = JSON.parse(listId);
  }
  if (listStatus) {
    if (listStatus.length === 0) listStatus = null;
    listStatus = JSON.parse(listStatus);
  }
  if (search) search = new RegExp(search, "i");
  if (!sort || sort === 1) sort = 1;
  else sort = -1;

  /*
  const maintain = await Maintainance.find(listId ? { gameId: { $in: listId } } : {})
    .find(listStatus ? { status: { $in: listStatus } } : {})
    .find(search ? { title: { $regex: search } } : {})
    .find(start ? { date: { $gt: Date(start) } } : {})
    .find(end ? { date: { $lt: Date(end) } } : {})
    .sort(sort ? { date: sort } : {});
    */
  const maintain = await Maintainance.paginate(
    {
      gameId: listId ? { $in: listId } : { $nin: [] },
      status: listStatus ? { $in: listStatus } : { $nin: [] },
      title: search ? { $regex: search } : { $nin: [] },
      $and: [
        { date: end ? { $lt: new Date(end) } : { $nin: [] } },
        { date: start ? { $gt: new Date(start) } : { $nin: [] } },
      ],
      gameType: type ? { type } : { $nin: [] },
    },
    { page: page || 1, limit: limit || 1000, sort: { date: sort } }
  );
  res.json(maintain);
};
const createMaintainace = async (req, res, next) => {
  let createBody;
  const date = new Date();
  if (!req.file) {
    createBody = { ...req.body, date, gameId: mongoose.Types.ObjectId(req.body.gameId) };
  } else {
    const result = await cloudinary.uploader.upload(req.file.path);
    if (!result) {
      const err = new Error("Can not upload image");
      err.statusCode = 400;
      return next(err);
    }

    createBody = {
      ...req.body,
      image: { url: result.secure_url, cloudinary_id: result.public_id },
      gameId: mongoose.Types.ObjectId(req.body.gameId),
      date,
    };
  }
  const maintain = await Maintainance.create(createBody);
  res.status(httpStatus.CREATED).send(maintain);
};
const updateMaintainance = async (req, res, next) => {
  let updateBody = { ...req.body };
  const date = Date.now();
  const maintain = await Maintainance.findById(req.params.id);
  if (!maintain) {
    const err = new Error("Can not find maintanance");
    err.statusCode = 404;
    return next(err);
  }

  let result = {};
  if (req.file) {
    if (maintain.image) {
      if (maintain.image.cloudinary_id) await cloudinary.uploader.destroy(maintain.image.cloudinary_id);
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
      url: result.secure_url ? result.secure_url : maintain.image.url,
      cloudinary_id: result.public_id ? result.public_id : maintain.image.cloudinary_id,
    },
    date,
  };
  Object.assign(maintain, updateBody);
  await maintain.save();
  res.status(200).json(maintain);
};
const deleteMaintainace = async (req, res, next) => {
  const { listId } = req.body;
  if (!listId) {
    const err = Error("Lack of listId");
    err.statusCode = 400;
    return next(err);
  }
  const maintains = await Maintainance.find({ _id: { $in: listId } });
  for (const maintain of maintains) {
    if (maintain.image.cloudinary_id) cloudinary.uploader.destroy(maintain.image.cloudinary_id);
  }
  await Maintainance.deleteMany({ _id: { $in: listId } });
  res.send("Delete Successfully");
};
module.exports = {
  getMaintainance,
  createMaintainace,
  updateMaintainance,
  deleteMaintainace,
};
