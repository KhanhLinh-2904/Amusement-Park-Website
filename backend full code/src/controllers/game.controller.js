const httpStatus = require("http-status");
const cloudinary = require("../utils/cloudinary");
const { Game } = require("../models");
const { crudService } = require("../services");

const getAllGame = async (req, res, next) => {
  const games = await Game.find({ isDeleted: false });
  res.json({ games });
};
const createGame = async (req, res, next) => {
  let createBody;
  if (!req.file) {
    createBody = { ...req.body };
  } else {
    const result = await cloudinary.uploader.upload(req.file.path);
    if (!result) {
      const err = new Error("Can not upload image");
      err.statusCode = 400;
      return next(err);
    }
    createBody = { ...req.body, image: { url: result.secure_url, cloudinary_id: result.public_id } };
  }
  const game = await crudService.create(Game, createBody);
  res.status(httpStatus.CREATED).send(game);
};
const updateGame = async (req, res, next) => {
  let updateBody = { ...req.body };
  const game = await Game.findById(req.params.id);
  if (!game) {
    const err = new Error("Can find Game");
    err.statusCode = 404;
    return next(err);
  }
  if (game.image) {
    if (game.image.cloudinary_id) await cloudinary.uploader.destroy(game.image.cloudinary_id);
  }
  let result = {};
  if (req.file) {
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
      url: result.secure_url ? result.secure_url : game.image.url,
      cloudinary_id: result.public_id ? result.public_id : game.image.cloudinary_id,
    },
  };
  Object.assign(game, updateBody);
  await game.save();
  res.status(200).json({
    game,
  });
};
const deleteGame = async (req, res, next) => {
  const game = await Game.findById(req.params.id);
  if (!game) {
    const err = new Error("Can not find the game");
    err.statusCode = 404;
    return next(err);
  }
  game.isDeleted = true;
  await game.save();
  res.status(200).send("Delete successfully");
};
const deleteActual = async (req, res, next) => {
  const games = await Game.find({ isDeleted: true });
  for (const game of games) {
    if (game.image.cloudinary_id) cloudinary.uploader.destroy(game.image.cloudinary_id);
  }
  await Game.deleteMany({ isDeleted: true });
  res.send("Delete Successfully");
};

module.exports = {
  getAllGame,
  createGame,
  updateGame,
  deleteGame,
  deleteActual,
};
