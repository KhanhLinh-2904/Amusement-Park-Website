const mongoose = require("mongoose");

const vipVoucherSchema = mongoose.Schema({
  vipId: {
    type: String,
  },
  voucherCode: {
    type: String,
  },
  discount: {
    type: Number,
  },
  dateEnd: {
    type: Date,
  },
  isUsed: {
    type: Boolean,
    default: false,
  },
});
const VipVoucher = mongoose.model("vipVoucher", vipVoucherSchema);
module.exports = VipVoucher;
