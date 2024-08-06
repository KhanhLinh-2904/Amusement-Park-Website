const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const entranceTicketSchema = mongoose.Schema({
  ticketId: {
    type: Number,
    unique: true,
  },
  type: {
    type: Number,
    required: true,
    enum: [1, 2, 3],
  },
  timeIn: {
    type: Date,
  },
  timeOut: {
    type: Date,
  },
  discount: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  vipCode: {
    type: String,
  },
  pointUse: {
    type: Number,
  },
  gameId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "game",
  },
  gameName: {
    type: String,
  },
  isPayed: {
    type: Boolean,
    default: false,
  },
  cost: {
    type: Number,
    default: 0,
  },
});
entranceTicketSchema.plugin(AutoIncrement, { inc_field: "ticketId" });

const EntranceTicket = mongoose.model("Ticket", entranceTicketSchema);
module.exports = EntranceTicket;
