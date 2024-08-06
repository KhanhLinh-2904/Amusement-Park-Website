const httpStatus = require("http-status");
const cloudinary = require("../utils/cloudinary");
const { Event, DailyCustomer, EventBooking } = require("../models");
const { crudService, emailService } = require("../services");

const getAllEvent = async (req, res, next) => {
  const events = await Event.find({ $or: [{ isHidden: { $ne: true } }, { isDeleted: { $ne: true } }] });
  res.json(events);
};
const getNewEvent = async (req, res, next) => {
  const newEvents = await Event.find({ isHidden: false });
  res.json(newEvents);
};
const getRunningEvent = async (req, res, next) => {
  const runningEvents = await Event.find({ meta: { $exists: true }, isDeleted: false });
  res.json(runningEvents);
};
const createNewEvent = async (req, res, next) => {
  if (req.body.meta) {
    const err = new Error("Forbidden");
    err.statusCode = 403;
    return next(err);
  }
  let createBody;
  if (!req.file) {
    createBody = { ...req.body };
  } else {
    const result = await cloudinary.uploader.upload(req.file.path);
    if (!result) {
      const err = new Error("Can not upload image");
      err.statusCode = 400;
      return next(err);
    }
    createBody = { ...req.body, image: { url: result.secure_url, cloudinary_id: result.public_id } };
  }
  const event = await Event.create(createBody);
  res.status(httpStatus.CREATED).send(event);
};
const updateEvent = async (req, res, next) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    const err = new Error("Can not find event");
    err.statusCode = 404;
    return next(err);
  }
  if (event.meta.startTime && req.body.meta) {
    const err = new Error("Fobidden");
    err.statusCode = 403;
    return next(err);
  }
  if (req.body.meta) {
    if (
      !req.body.meta.startTime ||
      !req.body.meta.endTime ||
      !req.body.meta.startBookingTime ||
      !req.body.meta.endBookingTime
    ) {
      const err = new Error("Lack of field!");
      err.statusCode = 400;
      return next(err);
    }
    const eventCheck = await Event.findOne({
      $or: [
        {
          "meta.startTime": { $lte: new Date(req.body.meta.startTime) },
          "meta.endTime": { $gte: new Date(req.body.meta.startTime) },
        },
        {
          "meta.startTime": { $lte: new Date(req.body.meta.endTime) },
          "meta.endTime": { $gte: new Date(req.body.meta.endTime) },
        },
      ],
      isDeleted: false,
    });

    if (eventCheck) {
      console.log(eventCheck);
      const err = new Error("Can not create because in the same period with another event");
      err.statusCode = 403;
      return next(err);
    }
  }
  let updateBody = { ...req.body };
  let result = {};
  if (req.file) {
    if (event.image) {
      if (event.image.cloudinary_id) await cloudinary.uploader.destroy(event.image.cloudinary_id);
    }
    result = await cloudinary.uploader.upload(req.file.path);
    if (!result) {
      const err = new Error("Can not upload avatar");
      err.statusCode = 400;
      return next(err);
    }
  }

  updateBody = {
    ...req.body,
    image: {
      url: result.secure_url ? result.secure_url : event.image.url,
      cloudinary_id: result.public_id ? result.public_id : event.image.cloudinary_id,
    },
    isDeleted: false,
    "meta.isStop": false,
  };
  Object.assign(event, updateBody);
  await event.save();
  res.status(200).json(event);
};
const deleteNewEvent = async (req, res, next) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    const err = new Error("Cannot found event!");
    err.statusCode = 404;
    return next(err);
  }
  event.isHidden = true;
  await event.save();
  res.status(200).send("Delete successfully");
};
const deleteRunningEvent = async (req, res, next) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    const err = new Error("Cannot found event!");
    err.statusCode = 404;
    return next(err);
  }
  event.meta = undefined;
  event.isDeleted = true;
  await EventBooking.deleteMany({ event: req.params.id });
  await event.save();
  res.status(200).send("Delete successfully");
};
const deleteActual = async (req, res, next) => {
  const events = await Event.find({ isDeleted: true });
  for (const event of events) {
    if (event.image.cloudinary_id) cloudinary.uploader.destroy(event.image.cloudinary_id);
  }
  await Event.deleteMany({ isDeleted: true });
  res.send("Delete Successfully");
};
const stopEvent = async (req, res, next) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    const err = new Error("Cannot found event!");
    err.statusCode = 404;
    return next(err);
  }
  event.meta.isStop = true;
  await event.save();
  res.send("Stop successfully!");
};
const sentNotificationEmail = async (req, res, next) => {
  const event = await Event.findbyId(req.param.id);
  const { discount } = event;
  let listEmail = await DailyCustomer.find({}, { email: 1, _id: 0 });
  listEmail = listEmail.map(el => el.email);
  const to = listEmail.join(",");
  const data = { to, subject: "New event upcoming!!" };
  try {
    await emailService.sendEjsMail({ template: "template", templateVars: { discount }, ...data });
    res.send("Send mail successfully !");
  } catch (error) {
    res.status(500).send("Send mail fail !");
  }
};
module.exports = {
  getNewEvent,
  getRunningEvent,
  createNewEvent,
  updateEvent,
  deleteActual,
  deleteNewEvent,
  deleteRunningEvent,
  sentNotificationEmail,
  stopEvent,
  getAllEvent,
};
