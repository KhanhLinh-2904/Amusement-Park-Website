const express = require("express");
const { metaDataController } = require("../../controllers");
const auth = require("../../middlewares/auth");

const router = express.Router();
router.get("/ticket", auth.verifyAdmin, metaDataController.getTicketStatistic);
router.get("/game", auth.verifyAdmin, metaDataController.getGameMetaData);
router.get("/totalprofit", auth.verifyAdmin, metaDataController.getTotalProfit);
router.get("/vip", auth.verifyAdmin, metaDataController.getVipMetaData);
module.exports = router;
