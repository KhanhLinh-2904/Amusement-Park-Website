const mongoose = require("mongoose");
const { EntranceTicket, Game, Vip, VipVoucher } = require("../models");
const { crudService, constantService } = require("../services");
const { EventBooking } = require("../models");
const { Event } = require("../models");

const getTicket = async (req, res, next) => {
  const tickets = await EntranceTicket.find({});
  res.json(tickets);
};
const createTicket = async (req, res, next) => {
  if (!req.body.tickNum || !req.body.typeTicket) {
    const err = new Error("Lack of type or number of ticket");
    err.statusCode = 400;
    return next(err);
  }
  if (req.body.tickNum < 1 || req.body.tickNum > 50) {
    const err = new Error("Minimum 1 ticket and maximum 50 ticket");
    err.statusCode = 404;
    return next(err);
  }
  if (req.body.typeTicket === 3 && !req.body.gameId) {
    const err = new Error("Lack of game Id");
    err.statusCode = 400;
    return next(err);
  }
  const timeIn = Date.now();
  if (req.body.typeTicket === 3) {
    const tickets = [];
    const game = await Game.findById(req.body.gameId);
    if (!game || game.isDeleted === true) {
      const err = new Error("Game not found");
      err.statusCode = 404;
      return next(err);
    }
    const cost = game.price;
    const gameName = game.name;

    for (let i = 0; i < req.body.tickNum; i += 1) {
      tickets.push(
        EntranceTicket.create({
          type: 3,
          gameId: mongoose.Types.ObjectId(req.body.gameId),
          cost,
          gameName,
          isPayed: true,
          timeIn,
        })
      );
    }
    const result = await Promise.all(tickets);
    res.json({ result });
  } else {
    let booking;
    let discount = 0;
    if (req.body.code) {
      booking = await EventBooking.findOne({ code: req.body.code });
      if (!booking) {
        const err = new Error("Can not found this coupon code!");
        err.statusCode = 404;
        return next(err);
      }
      if (!booking.isEmailVerify) {
        const err = new Error("The email is not verify!");
        err.statusCode = 403;
        return next(err);
      }
      if (booking.isUsed) {
        const err = new Error("This coupon code is used");
        err.statusCode = 403;
        return next(err);
      }
      const event = await Event.findById(booking.event);
      if (!event) {
        const err = new Error("Not found event");
        err.statusCode = 404;
        return next(err);
      }
      if (event.isDeleted) {
        const err = new Error("This coupon code is expired");
        err.statusCode = 403;
        return next(err);
      }
      if (!event.meta) {
        const err = new Error("The event is not running");
        err.statusCode = 403;
        return next(err);
      }
      if (Date.now() < new Date(event.meta.startTime) || Date.now() > new Date(event.meta.endTime)) {
        const err = new Error("The code can only use in the event");
        err.statusCode = 403;
        return next(err);
      }
      discount = event.discount;
    }
    if (discount > 100) discount = 100;
    const tickets = [];

    for (let i = 0; i < req.body.tickNum; i += 1) {
      if (i <= 4) tickets.push(EntranceTicket.create({ type: req.body.typeTicket, discount, timeIn }));
      else tickets.push(EntranceTicket.create({ type: req.body.typeTicket, timeIn }));
    }
    if (booking) {
      try {
        await EventBooking.findOneAndUpdate({ code: req.body.code }, { isUsed: true });
      } catch (err) {
        return next(err);
      }
    }
    const result = await Promise.all(tickets);
    res.json({
      result,
      name: booking ? booking.name : undefined,
      email: booking ? booking.email : undefined,
    });
  }
};
const createTicketForVip = async (req, res, next) => {
  if (!req.body.uuid && !req.body.vipCode) {
    const err = new Error("Lack of field");
    err.statusCode = 404;
    return next(err);
  }
  let vip;
  if (req.body.uuid) vip = await Vip.findById(req.body.uuid);
  else vip = await Vip.findOne({ vipCode: req.body.vipCode });
  if (!vip) {
    const err = new Error("Cannot found vip!");
    err.statusCode = 404;
    return next(err);
  }
  if (vip.dateEnd < Date.now()) {
    const err = new Error("The vip account is expired!");
    err.statusCode = 400;
    return next(err);
  }
  if (!req.body.tickNum || !req.body.typeTicket) {
    const err = new Error("Lack of type or number of ticket");
    err.statusCode = 400;
    return next(err);
  }
  if (req.body.tickNum < 1 || req.body.tickNum > 50) {
    const err = new Error("Minimum 1 ticket and maximum 50 ticket");
    err.statusCode = 404;
    return next(err);
  }
  if (req.body.typeTicket === 3 && !req.body.gameId) {
    const err = new Error("Lack of game Id");
    err.statusCode = 400;
    return next(err);
  }
  const timeIn = Date.now();
  if (req.body.typeTicket === 3) {
    const tickets = [];
    const game = await Game.findById(req.body.gameId);
    if (!game || game.isDeleted === true) {
      const err = new Error("Game not found");
      err.statusCode = 404;
      return next(err);
    }
    const cost = game.price;
    const gameName = game.name;

    for (let i = 0; i < req.body.tickNum; i += 1) {
      tickets.push(
        EntranceTicket.create({
          type: 3,
          gameId: mongoose.Types.ObjectId(req.body.gameId),
          cost,
          gameName,
          isPayed: true,
          timeIn,
        })
      );
    }
    const result = await Promise.all(tickets);
    res.json({ result });
  } else {
    let booking;
    let discount = 0;
    if (req.body.code) {
      booking = await EventBooking.findOne({ code: req.body.code });
      if (!booking) {
        const err = new Error("Can not found this coupon code!");
        err.statusCode = 404;
        return next(err);
      }
      if (!booking.isEmailVerify) {
        const err = new Error("The email is not verify!");
        err.statusCode = 403;
        return next(err);
      }
      if (booking.isUsed) {
        const err = new Error("This coupon code is used");
        err.statusCode = 403;
        return next(err);
      }
      const event = await Event.findById(booking.event);
      if (!event) {
        const err = new Error("Not found event");
        err.statusCode = 404;
        return next(err);
      }
      if (event.isDeleted) {
        const err = new Error("This coupon code is expired");
        err.statusCode = 403;
        return next(err);
      }
      if (!event.meta) {
        const err = new Error("The event is not running");
        err.statusCode = 403;
        return next(err);
      }
      if (Date.now() < new Date(event.meta.startTime) || Date.now() > new Date(event.meta.endTime)) {
        const err = new Error("The code can only use in the event");
        err.statusCode = 403;
        return next(err);
      }
      discount += event.discount;
    }
    if (req.body.vipVoucherCode) {
      const vipVoucherCode = await VipVoucher.findOne({ voucherCode: req.body.vipVoucherCode });
      if (!vipVoucherCode) {
        const err = new Error("Can not find!");
        err.statusCode = 404;
        return next(err);
      }
      if (vipVoucherCode.vipId !== vip._id) {
        const err = new Error("This voucher is not belong to you!");
        err.statusCode = 404;
        return next(err);
      }
      if (vipVoucherCode.isUsed) {
        const err = new Error("This voucher is used!");
        err.statusCode = 400;
        return next(err);
      }
      if (Date.now() > vipVoucherCode.dateEnd) {
        const err = new Error("This voucher is expired!");
        err.statusCode = 400;
        return next(err);
      }
      discount += vipVoucherCode.discount;
      vipVoucherCode.isUsed = true;
      await vipVoucherCode.save();
    }
    const constant = await constantService.getConstant();
    discount += constant.discount.vip;
    if (discount > 100) discount = 100;

    const tickets = [];

    for (let i = 0; i < req.body.tickNum; i += 1) {
      if (i <= 4) tickets.push(EntranceTicket.create({ type: req.body.typeTicket, discount, timeIn, vipCode: vip.vipCode }));
      else tickets.push(EntranceTicket.create({ type: req.body.typeTicket, timeIn, vipCode: vip.vipCode }));
    }
    if (booking) {
      try {
        await EventBooking.findOneAndUpdate({ code: req.body.code }, { isUsed: true });
      } catch (err) {
        return next(err);
      }
    }

    const dayPrice = constant.ticketPrice.day;
    const turnPrice = constant.ticketPrice.turn;
    if (req.body.typeTicket === 1) {
      vip.point += (dayPrice * req.body.tickNum) / 10;
    } else if (req.body.typeTicket === 2) {
      vip.point += (turnPrice * req.body.tickNum) / 10;
    }
    const result = await Promise.all(tickets);
    await vip.save();
    res.json({
      result,
      name: booking ? booking.name : vip.name,
      email: booking ? booking.email : vip.email,
    });
  }
};
const updateTicket = async (req, res, next) => {
  if (req.body.onlyGet === true) {
    const tickets = await EntranceTicket.find({ ticketId: { $in: req.body.listId } });
    res.send(tickets);
  }

  const constant = await constantService.getConstant();
  const dayPrice = constant.ticketPrice.day;
  const turnPrice = constant.ticketPrice.turn;
  const extraPrice = constant.ticketPrice.extra;
  const ticketList = [];
  if (!req.body.listId) {
    const err = new Error("Lack of listId");
    err.statusCode = 400;
    return next(err);
  }
  let total = 0;
  const list = req.body.listId;
  const saveDb = [];
  const tickets = await EntranceTicket.find({ ticketId: { $in: list } });
  for (const ticket of tickets) {
    // const ticket = await crudService.getbyParam(EntranceTicket, { ticketId: id });
    const updateContent = {};
    if (ticket) {
      if (ticket.type === 1) {
        updateContent.cost = (dayPrice * (100 - ticket.discount)) / 100;
        total += updateContent.cost;
      } else if (ticket.type === 3) {
        total += ticket.cost;
      } else {
        if (!ticket.isPayed) {
          if (req.body.timeOut) updateContent.timeOut = req.body.timeOut;
          else updateContent.timeOut = new Date();
          const diff = Math.round((updateContent.timeOut - ticket.timeIn) / 60000) - 120 - 15;
          if (diff <= 0) {
            updateContent.cost = (turnPrice * (100 - ticket.discount)) / 100;
            total += updateContent.cost;
          } else {
            const power = Math.ceil(diff / 30);
            if (power > 4) updateContent.cost = ((6 * extraPrice + turnPrice) * (100 - ticket.discount)) / 100;
            else {
              updateContent.cost =
                (Math.round((extraPrice * (1.2 ** power - 1)) / 0.2 + turnPrice) * (100 - ticket.discount)) / 100;
            }
            total += updateContent.cost;
          }
        } else total += ticket.cost;
      }
      Object.assign(ticket, updateContent);
      ticketList.push(ticket);

      saveDb.push(ticket.save());
    }
  }
  await Promise.all(saveDb);
  res.status(200).json({
    tickList: ticketList,
    totalCost: total,
  });
};

const updateVipTicket = async (req, res, next) => {
  const constant = await constantService.getConstant();
  const dayPrice = constant.ticketPrice.day;
  const turnPrice = constant.ticketPrice.turn;
  const extraPrice = constant.ticketPrice.extra;
  const vipDiscount = constant.discount.vip;

  let { point } = req.body;
  if (!point) point = 0;
  let remainPoint = point;

  const ticketList = [];
  if (!req.body.listId) {
    const err = new Error("Lack of listId");
    err.statusCode = 400;
    return next(err);
  }
  let total = 0;
  const list = req.body.listId;
  const saveDb = [];
  const tickets = await EntranceTicket.find({ ticketId: { $in: list } });
  const vip = await Vip.findOne({ vipCode: tickets[0].vipCode });
  if (!vip) {
    const err = new Error("Cannot find Vip");
    err.statusCode = 404;
    return next(err);
  }
  if (point > vip.point) {
    const err = new Error("The point is greater than the current vip point");
    err.statusCode = 400;
    return next(err);
  }
  for (const ticket of tickets) {
    // const ticket = await crudService.getbyParam(EntranceTicket, { ticketId: id });
    const updateContent = {};
    if (ticket) {
      if (ticket.type === 1) {
        updateContent.cost = (dayPrice * (100 - ticket.discount)) / 100;
        if (ticket.vipCode) {
          updateContent.cost *= (100 - vipDiscount) / 100;
          if (remainPoint >= updateContent.cost && remainPoint !== 0) {
            updateContent.pointUse = updateContent.cost;
            updateContent.cost = 0;
            remainPoint -= updateContent.pointUse;
          } else if (remainPoint < updateContent.cost && remainPoint !== 0) {
            updateContent.pointUse = remainPoint;
            updateContent.cost -= remainPoint;
            remainPoint = 0;
          } else {
            updateContent.pointUse = 0;
          }
        }
        total += updateContent.cost;
      } else if (ticket.type === 3) {
        total += ticket.cost;
      } else {
        if (!ticket.isPayed) {
          if (req.body.timeOut) updateContent.timeOut = req.body.timeOut;
          else updateContent.timeOut = new Date();
          const diff = Math.round((updateContent.timeOut - ticket.timeIn) / 60000) - 120 - 15;
          if (diff <= 0) {
            updateContent.cost = (turnPrice * (100 - ticket.discount)) / 100;
            if (ticket.vipCode) {
              updateContent.cost *= (100 - vipDiscount) / 100;
              if (remainPoint >= updateContent.cost && remainPoint !== 0) {
                updateContent.pointUse = updateContent.cost;
                updateContent.cost = 0;
                remainPoint -= updateContent.pointUse;
              } else if (remainPoint < updateContent.cost && remainPoint !== 0) {
                updateContent.pointUse = remainPoint;
                updateContent.cost -= remainPoint;
                remainPoint = 0;
              } else {
                updateContent.pointUse = 0;
              }
            }
            total += updateContent.cost;
          } else {
            const power = Math.ceil(diff / 30);
            if (power > 4) updateContent.cost = ((6 * extraPrice + turnPrice) * (100 - ticket.discount)) / 100;
            else {
              updateContent.cost =
                (Math.round((extraPrice * (1.2 ** power - 1)) / 0.2 + turnPrice) * (100 - ticket.discount)) / 100;
              if (ticket.vipCode) {
                updateContent.cost *= (100 - vipDiscount) / 100;
                if (remainPoint >= updateContent.cost && remainPoint !== 0) {
                  updateContent.pointUse = updateContent.cost;
                  updateContent.cost = 0;
                  remainPoint -= updateContent.pointUse;
                } else if (remainPoint < updateContent.cost && remainPoint !== 0) {
                  updateContent.pointUse = remainPoint;
                  updateContent.cost -= remainPoint;
                  remainPoint = 0;
                } else {
                  updateContent.pointUse = 0;
                }
              }
            }
            total += updateContent.cost;
          }
        } else total += ticket.cost;
      }
      Object.assign(ticket, updateContent);
      ticketList.push(ticket);
      saveDb.push(ticket.save());
    }
  }
  await Promise.all(saveDb);
  res.status(200).json({
    tickList: ticketList,
    totalCost: total,
  });
};
/*
const deleteTicket = async (req, res, next) => {
  await crudService.deleteById(EntranceTicket, req.params.ticketId);
  res.status(httpStatus.NO_CONTENT).send();
};
*/
const payTicket = async (req, res, next) => {
  const list = req.body.listId;
  const result = await EntranceTicket.updateMany({ ticketId: { $in: list }, isPayed: false }, { $set: { isPayed: true } });
  res.status(200).json({
    result,
  });
};
const payVip = async (req, res, next) => {
  const list = req.body.listId;
  const vip = await Vip.findOne({ vipCode: req.body.vipCode });
  if (!vip) {
    const err = new Error("Cannot find Vip");
    err.statusCode = 404;
    return next(err);
  }
  const pointUse = await EntranceTicket.aggregate([
    {
      $match: { ticketId: { $in: list } },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$pointUse" },
      },
    },
  ]);
  vip.point -= pointUse[0].total;
  await vip.save();
  const result = await EntranceTicket.updateMany({ ticketId: { $in: list }, isPayed: false }, { $set: { isPayed: true } });
  res.status(200).json({
    result,
  });
};
module.exports = {
  createTicket,
  updateTicket,
  getTicket,
  payTicket,
  createTicketForVip,
  payVip,
  updateVipTicket,
};
