const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const Game = require("./game.model");

const maintainSchema = mongoose.Schema({
  gameId: {
    type: mongoose.Types.ObjectId,
    ref: "game",
  },
  description: {
    type: String,
    default: "No description",
  },
  image: {
    url: { type: String },
    cloudinary_id: { type: String },
  },
  status: {
    type: Number,
    enum: [0, 1, 2],
    default: 0,
  },
  date: {
    type: Date,
  },
  title: {
    type: String,
    default: "Untitled",
  },
  gameType: {
    type: Number,
    enum: [1, 2],
  },
});
maintainSchema.pre("save", async function (next) {
  const maintain = this;
  const game = await Game.findById(maintain.gameId);
  maintain.gameType = game.type;
  next();
});
maintainSchema.plugin(mongoosePaginate);
const Maintainance = mongoose.model("maintainance", maintainSchema);
module.exports = Maintainance;
