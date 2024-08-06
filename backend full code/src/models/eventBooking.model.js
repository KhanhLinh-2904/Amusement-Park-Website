const mongoose = require("mongoose");
const validator = require("validator");
const Event = require("./event.model");

const eventBookingSchema = mongoose.Schema({
  email: {
    type: String,
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
  },
  code: {
    type: String,
    unique: true,
  },
  isEmailVerify: {
    type: Boolean,
    default: false,
  },
  isUsed: {
    type: Boolean,
    default: false,
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "events",
  },
});
const EventBooking = mongoose.model("eventbooking", eventBookingSchema);
module.exports = EventBooking;
