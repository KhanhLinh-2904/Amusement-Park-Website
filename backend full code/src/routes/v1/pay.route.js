const express = require("express");
const { paymentController } = require("../../controllers");
const auth = require("../../middlewares/auth");

const router = express.Router();
router.post("/mintQR", auth.verifyStaff, paymentController.mintQRPayment);
router.get("/execute", paymentController.executePayment);
router.post("/vip", paymentController.createExtendVipPayment);
router.get("/vip", paymentController.executeVipExtend);
router.get("/cancel", paymentController.cancelPayment);
module.exports = router;
