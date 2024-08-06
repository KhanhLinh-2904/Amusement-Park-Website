const mongoose = require("mongoose");
const validator = require("validator");

const vipSchema = mongoose.Schema({
  email: {
    type: String,
    unique: true,
    trim: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Invalid email");
      }
    },
  },
  name: {
    type: String,
    required: true,
  },
  vipCode: {
    type: String,
    unique: true,
  },
  phone: {
    type: String,
    unique: true,
  },
  point: {
    type: Number,
    default: 1000,
  },
  dateEnd: {
    type: Date,
  },
  _id: {
    type: String,
  },
  qrImage: {
    url: { type: String },
    cloudinary_id: { type: String },
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
});
const Vip = mongoose.model("vips", vipSchema);
module.exports = Vip;
