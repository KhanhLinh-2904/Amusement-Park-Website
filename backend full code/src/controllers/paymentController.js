const QRCode = require("qrcode");
const paypal = require("../utils/paypal");
const { EntranceTicket, Vip } = require("../models");

const mintQRPayment = async (req, res, next) => {
  if (!req.body.listId) {
    const err = new Error("Lack of listId");
    err.statusCode = 400;
    return next(err);
  }
  const { listId } = req.body;
  const tickets = await EntranceTicket.find({ ticketId: { $in: listId }, isPayed: false }, { ticketId: 1, cost: 1, _id: 0 });
  if (!tickets || tickets.length === 0) {
    return res.send("");
  }
  const totalCost = (tickets.reduce((sum, a) => sum + a.cost, 0) / 23000).toFixed(2);
  const paymentJson = {
    intent: "sale",
    payer: {
      payment_method: "paypal",
    },
    redirect_urls: {
      return_url: `https://tinkerbell-garden.herokuapp.com/api/v1/pay/execute?total=${totalCost}&list=${listId}`,
      cancel_url: "https://tinkerbell-garden.herokuapp.com/api/v1/pay/cancel",
    },
    transactions: [
      {
        amount: {
          currency: "USD",
          total: totalCost,
        },
        description: "Payment ticket",
      },
    ],
  };
  paypal.payment.create(paymentJson, async (error, payment) => {
    if (error) {
      throw error;
    } else {
      console.log(payment);
      const qrCode = await QRCode.toDataURL(payment.links[1].href);
      res.send(qrCode);
    }
  });
};
const executePayment = async (req, res, next) => {
  const payerId = req.query.PayerID;
  const { paymentId } = req.query;
  let listId = req.query.list.split(",");
  listId = listId.map(el => Number(el));
  const execute_payment_json = {
    payer_id: payerId,
    transactions: [
      {
        amount: {
          currency: "USD",
          total: req.query.total,
        },
      },
    ],
  };
  paypal.payment.execute(paymentId, execute_payment_json, async (error, payment) => {
    if (error) {
      throw error;
    } else {
      await EntranceTicket.updateMany({ ticketId: { $in: listId }, isPayed: false }, { $set: { isPayed: true } });
      res.redirect("/congratPayment");
    }
  });
};
const createExtendVipPayment = async (req, res, next) => {
  if (!req.body.code) {
    const err = new Error("Lack of code");
    err.statusCode = 400;
    return next(err);
  }
  const vip = await Vip.findOne({ vipCode: req.body.code });

  const paymentJson = {
    intent: "sale",
    payer: {
      payment_method: "paypal",
    },
    redirect_urls: {
      return_url: `https://tinkerbell-garden.herokuapp.com/api/v1/pay/vip?code=${req.body.code}`,
      cancel_url: "https://tinkerbell-garden.herokuapp.com/api/v1/pay/cancel",
    },
    transactions: [
      {
        amount: {
          currency: "USD",
          total: 17.4,
        },
        description: "Extending Vip",
      },
    ],
  };
  paypal.payment.create(paymentJson, async (error, payment) => {
    if (error) {
      throw error;
    } else {
      console.log(payment.links[1].href);
      res.redirect(payment.links[1].href);
    }
  });
};
const executeVipExtend = async (req, res, next) => {
  const payerId = req.query.PayerID;
  const { paymentId, code } = req.query;
  const execute_payment_json = {
    payer_id: payerId,
    transactions: [
      {
        amount: {
          currency: "USD",
          total: 17.4,
        },
      },
    ],
  };
  paypal.payment.execute(paymentId, execute_payment_json, async (error, payment) => {
    if (error) {
      throw error;
    } else {
      const vip = await Vip.findOne({ vipCode: code });
      const dateEnd = new Date(vip.dateEnd).getTime() + 365 * 24 * 60 * 60 * 1000;
      const updateBody = { dateEnd };
      Object.assign(vip, updateBody);
      await vip.save();
      res.send("Successfully");
    }
  });
};
const cancelPayment = async (req, res, next) => {
  res.send("Cancel payment");
};
module.exports = { mintQRPayment, executePayment, cancelPayment, createExtendVipPayment, executeVipExtend };
