const { EntranceTicket, Vip } = require("../models");

const getTotalProfit = async (req, res, next) => {
  const listDuration = [1, 7, 30, 365];
  const fieldStatistic = ["day", "week", "month", "year"];
  const listEntranceStatistic = [];
  const listGameStatisctic = [];
  for (const duration of listDuration) {
    const d = new Date();
    d.setDate(d.getDate() - duration);
    const totalEntranceCost = EntranceTicket.aggregate([
      { $match: { timeIn: { $gt: d }, type: { $ne: 3 }, isPayed: true } },
      {
        $group: {
          _id: null,
          totalProfit: { $sum: "$cost" },
        },
      },
    ]);
    const totalGameCost = EntranceTicket.aggregate([
      { $match: { timeIn: { $gt: d }, type: 3, isPayed: true } },
      {
        $group: {
          _id: null,
          totalProfit: { $sum: "$cost" },
        },
      },
    ]);
    listEntranceStatistic.push(totalEntranceCost);
    listGameStatisctic.push(totalGameCost);
  }
  const entrance = await Promise.all(listEntranceStatistic);
  const game = await Promise.all(listGameStatisctic);
  const entranceresult = {};
  const gameresult = {};
  fieldStatistic.forEach((element, index) => {
    entranceresult[element] = entrance[index].length !== 0 ? entrance[index][0].totalProfit : 0;
  });
  fieldStatistic.forEach((element, index) => {
    gameresult[element] = game[index].length !== 0 ? game[index][0].totalProfit : 0;
  });
  res.json({ entrance: entranceresult, game: gameresult });
};
const getGameMetaData = async (req, res, next) => {
  const listDuration = [1, 7, 30];
  const fieldStatistic = ["day", "week", "month"];
  const listGameStatistic = [];
  for (const duration of listDuration) {
    const d = new Date();
    d.setDate(d.getDate() - duration);
    const gameData = EntranceTicket.aggregate([
      { $match: { timeIn: { $gt: d }, type: 3 } },
      {
        $group: {
          _id: "$gameId",
          totalNumber: { $sum: 1 },
          totalProfit: { $sum: "$cost" },
        },
      },
      {
        $lookup: {
          from: "games",
          localField: "_id",
          foreignField: "_id",
          as: "gameInfo",
        },
      },
      {
        $unwind: "$gameInfo",
      },
      {
        $match: { "gameInfo.isDeleted": false },
      },
      {
        $addFields: { name: "$gameInfo.name" },
      },
      {
        $project: { _id: 1, totalNumber: 1, totalProfit: 1, name: 1 },
      },
      {
        $sort: {
          totalProfit: -1,
        },
      },
    ]);
    listGameStatistic.push(gameData);
  }
  const game = await Promise.all(listGameStatistic);
  const result = {};

  fieldStatistic.forEach((element, index) => {
    result[element] = game[index];
  });
  res.json(result);
};
const getVipMetaData = async (req, res, next) => {
  const vipStatisTic = await Vip.aggregate([
    {
      $lookup: {
        from: "tickets",
        localField: "vipCode",
        foreignField: "vipCode",
        as: "tickVip",
      },
    },
    {
      $unwind: "$tickVip",
    },
    {
      $group: {
        _id: "$vipCode",
        name: { $first: "$name" },
        totalPayment: {
          $sum: {
            $cond: [{ $eq: ["$tickVip.isPayed", true] }, "$tickVip.cost", 0],
          },
        },
        totalTicketBuy: { $sum: 1 },
        point: { $first: "$point" },
      },
    },
    {
      $sort: {
        totalPayment: -1,
      },
    },
    {
      $limit: 3,
    },
  ]);
  const vipCount = await Vip.aggregate([
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
      },
    },
  ]);
  const { count } = vipCount[0];

  res.json({ vipStatisTic, count });
};
const getTicketStatistic = async (req, res, next) => {
  // const listPeriod = [0, 12, 24, 36, 48, 96, 192, 336, 720, 2880, 5760, 8760].map(el => Date.now() - el * 60 * 60 * 1000);
  const listPeriod = [];
  for (let i = 34; i >= 0; i -= 1) {
    listPeriod.push(Date.now() - i * 60 * 60 * 1000 * 24);
  }

  const listStatistic = [];
  for (let i = 0; i < 35; i += 1) {
    const up = listPeriod[i + 1];
    const down = listPeriod[i];

    const ticketStatistic = EntranceTicket.aggregate([
      { $match: { timeIn: { $lt: new Date(up), $gt: new Date(down) }, isPayed: true } },
      {
        $group: {
          _id: "$type",
          totalNumber: { $sum: 1 },
          totalPayment: { $sum: "$cost" },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);
    listStatistic.push(ticketStatistic);
  }
  const ticket = await Promise.all(listStatistic);
  const fakeList = listPeriod.map(el => el - 60 * 60 * 1000).slice(0, 35);
  // console.log(fakeList);
  const result = {};

  fakeList.forEach((element, index) => {
    result[element] = ticket[index];
  });

  res.json(result);
};
/*
const getMetaData = async (req, res, next) => {
  // Total từ trước đến giờ
  let { duration } = req.query;
  if (!duration) duration = 365 * 100;
  duration = Number(duration);
  const d = new Date();
  d.setDate(d.getDate() - duration);
  const statistiWeekType1 = await EntranceTicket.aggregate([
    { $match: { timeIn: { $gt: d }, type: 1 } },

    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$timeIn" } },
        totalNumber: { $sum: 1 },
        totalPayment: { $sum: "$cost" },
      },
    },
  ]);
  const vipStatisTic = await Vip.aggregate([
    {
      $lookup: {
        from: "tickets",
        localField: "vipCode",
        foreignField: "vipCode",
        as: "tickVip",
      },
    },
    {
      $unwind: "$tickVip",
    },
    {
      $group: {
        _id: "$vipCode",
        totalPayment: { $sum: "$tickVip.cost" },
        totalPointUse: { $sum: "$tickVip.pointUse" },
        totalNumType1: {
          $sum: {
            $cond: [{ $eq: ["$tickVip.type", 1] }, 1, 0],
          },
        },
        totalNumType2: {
          $sum: {
            $cond: [{ $eq: ["$tickVip.type", 2] }, 1, 0],
          },
        },
        totalNumType3: {
          $sum: {
            $cond: [{ $eq: ["$tickVip.type", 3] }, 1, 0],
          },
        },
      },
    },
    {
      $sort: {
        totalPayment: -1,
      },
    },
  ]);

  res.json({ statistiWeekType1, vipStatisTic });
};
const getTicketStatic = async (req, res, next) => {
  let { duration } = req.query;
  if (!duration) duration = 365 * 100;
  duration = Number(duration);
  const d = new Date();
  d.setDate(d.getDate() - duration);
  const tickets = await EntranceTicket.aggregate([
    { $match: { timeIn: { $gt: d }, isPayed: true } },
    {
      $group: {
        totalNumber: { $sum: 1 },
        totalPayment: { $sum: "$cost" },
        totalPayed: {
          $sum: {
            $cond: [{ $eq: ["$isPayed", true] }, 1, 0],
          },
        },
      },
    },
  ]);
  res.json(tickets);
};
const getTicketTotal = async (req, res, next) => {};
const getEventStatistic = async (req, res, next) => {
  const eventStatisTic = await Event.aggregate([
    {
      $lookup: {
        from: "eventbookings",
        localField: "_id",
        foreignField: "event",
        as: "statistic",
      },
    },
    {
      $unwind: "$statistic",
    },
    {
      $group: {
        _id: "$vipCode",
        totalPayment: { $sum: "$tickVip.cost" },
        totalNumType1: {
          $sum: {
            $cond: [{ $eq: ["$tickVip.type", 1] }, 1, 0],
          },
        },
        totalNumType2: {
          $sum: {
            $cond: [{ $eq: ["$tickVip.type", 2] }, 1, 0],
          },
        },
        totalNumType3: {
          $sum: {
            $cond: [{ $eq: ["$tickVip.type", 3] }, 1, 0],
          },
        },
      },
    },
    {
      $sort: {
        totalPayment: -1,
      },
    },
  ]);
};
*/
module.exports = { getTicketStatistic, getGameMetaData, getTotalProfit, getVipMetaData };
