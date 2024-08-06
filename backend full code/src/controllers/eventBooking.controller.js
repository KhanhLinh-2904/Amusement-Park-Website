const voucherCodes = require("voucher-code-generator");
const QRCode = require("qrcode");

const { EventBooking, Event } = require("../models");
const { emailService } = require("../services");

/*
const htmlTemplate = (name, code) => `<h1>Thank you</h1>
  <h2>Thank ${name} for booking ticket.Hope you have fun in our event </h2>
  <h4>Your coupon code is <strong>${code}</strong><h4>
  <h4>Please enter the below link to verify your booking</h4>
  <a href="http://localhost:5000/api/v1/eventbooking/verify/${code}">VerifyEmail</a>`;
  */
const getAllBooking = async (req, res, next) => {
  try {
    const booking = await EventBooking.find({});
    res.status(200).json({
      booking,
    });
  } catch (error) {
    next(error);
  }
};

const createBooking = async (req, res, next) => {
  const event = await Event.findById(req.body.id);
  if (!event) {
    const err = new Error("Event not found");
    err.statusCode = 404;
    return next(err);
  }
  if (!event.meta) {
    const err = new Error("Event is not running");
    err.statusCode = 400;
    return next(err);
  }
  if (
    event.meta.isStop ||
    Date.now() < new Date(event.meta.startBookingTime) ||
    Date.now() > new Date(event.meta.endBookingTime)
  ) {
    const err = new Error("Sorry!This event is no longer allow booking");
    err.statusCode = 400;
    return next(err);
  }

  const idEvent = event._id;
  const checkEvent = await EventBooking.findOne({ email: req.body.email, event: idEvent });
  if (checkEvent) {
    const err = new Error("You have booking this event");
    err.statusCode = 404;
    return next(err);
  }
  const code = voucherCodes.generate({
    length: 5,
    charset: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
  })[0];
  let booking;

  try {
    booking = await EventBooking.create({ ...req.body, code, event: idEvent });
  } catch (err) {
    return next(err);
  }

  const data = { to: booking.email, subject: "Please verify your booking!!" };
  try {
    await emailService.sendEjsMail({
      template: "template1",
      templateVars: { name: booking.name, code: booking.code },
      ...data,
    });
    res.send("Send mail successfully !");
  } catch (error) {
    res.status(500).send("Send mail fail !");
  }
};
const verifyEmail = async (req, res, next) => {
  const { slug } = req.params;
  const booking = await EventBooking.findOneAndUpdate({ code: slug }, { isEmailVerify: true });
  if (!booking) {
    const err = new Error("Cannot found");
    err.statusCode = 404;
    return next(err);
  }
  res.redirect("/congrat");
};

module.exports = {
  getAllBooking,
  createBooking,
  verifyEmail,
};
