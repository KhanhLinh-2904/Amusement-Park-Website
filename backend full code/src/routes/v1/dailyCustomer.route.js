const express = require("express");
const { dailyController } = require("../../controllers");
const auth = require("../../middlewares/auth");

const router = express.Router();
router.get("/", auth.verifyStaff, dailyController.getCustomer);
router.post("/", auth.verifyStaff, dailyController.createCustomer);

module.exports = router;
