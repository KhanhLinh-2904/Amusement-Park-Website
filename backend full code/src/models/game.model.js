const mongoose = require("mongoose");

const gameSchema = mongoose.Schema({
  type: {
    type: Number,
    default: 1,
    enums: [1, 2],
  },
  name: {
    type: String,
    default: "Untitled",
    trim: true,
  },
  description: {
    type: String,
  },
  image: {
    url: { type: String },
    cloudinary_id: { type: String },
  },
  price: {
    type: Number,
    default: 0,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
});
const Game = mongoose.model("game", gameSchema);

module.exports = Game;
