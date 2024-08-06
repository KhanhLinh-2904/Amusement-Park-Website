const express = require("express");
const { vipController } = require("../../controllers");
const auth = require("../../middlewares/auth");

const router = express.Router();
router.get("/", auth.verifyUser, vipController.getAllVip);
router.get("/byid/:uuid", auth.verifyUser, vipController.getVipById);
router.get("/bycode/:code", auth.verifyUser, vipController.getVipByCode);
router.post("/phone", auth.verifyUser, vipController.getVipbyPhone);
router.post("/", auth.verifyStaff, vipController.createVip);
router.patch("/", auth.verifyStaff, vipController.updateVip);
router.post("/delete", auth.verifyAdmin, vipController.deleteVip);
module.exports = router;
