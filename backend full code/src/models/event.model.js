const mongoose = require("mongoose");

const eventSchema = mongoose.Schema({
  title: {
    type: String,
    default: "Untitled",
    trim: true,
  },
  description: {
    type: String,
  },
  discount: {
    type: Number,
    default: 0,
  },
  image: {
    url: { type: String },
    cloudinary_id: { type: String },
  },
  meta: {
    startTime: { type: Date },
    endTime: { type: Date },
    startBookingTime: { type: Date },
    endBookingTime: { type: Date },
    isStop: { type: Boolean },
  },
  isDeleted: { type: Boolean, default: true },
  isHidden: { type: Boolean, default: false },
});
const Event = mongoose.model("events", eventSchema);
module.exports = Event;
