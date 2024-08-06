const mongoose = require("mongoose");

const discountCondition = { type: Number, min: 0, max: 100 };
const constantSchema = mongoose.Schema({
  ticketPrice: {
    day: { type: Number, default: 300000 },
    turn: { type: Number, default: 200000 },
    extra: { type: Number, default: 50000 },
  },
  discount: {
    general: { ...discountCondition, default: 0 },
    vip: { ...discountCondition, default: 20 },
    vipReserved: { ...discountCondition, default: 30 },
  },
  gameCost: [
    {
      id: { type: Number, ref: "game" },
      cost: Number,
    },
  ],
});
const Constant = mongoose.model("constant", constantSchema);
module.exports = Constant;
