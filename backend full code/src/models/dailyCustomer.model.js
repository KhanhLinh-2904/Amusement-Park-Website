const mongoose = require("mongoose");
const validator = require("validator");

const dailyCustomerSchema = mongoose.Schema({
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
});
const DailyCustomer = mongoose.model("dailycustomer", dailyCustomerSchema);
module.exports = DailyCustomer;
