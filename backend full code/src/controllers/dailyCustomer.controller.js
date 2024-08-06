const { DailyCustomer } = require("../models");

const getCustomer = async (req, res, next) => {
  let customer;
  if (req.body.email) {
    customer = await DailyCustomer.findOne({ email: req.body.email });
  } else {
    customer = await DailyCustomer.find({});
  }
  res.send(customer);
};
const createCustomer = async (req, res, next) => {
  let customer;
  try {
    customer = await DailyCustomer.create(req.body);
  } catch (err) {
    return next(err);
  }
  res.send(customer);
};
module.exports = {
  getCustomer,
  createCustomer,
};
