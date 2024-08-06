const express = require("express");
const { vipVoucherController } = require("../../controllers");
const auth = require("../../middlewares/auth");

const router = express.Router();
router.post("/getvoucher", auth.verifyUser, vipVoucherController.getVipVoucher);
router.post("/", auth.verifyCustomer, vipVoucherController.createVipVoucher);
module.exports = router;
