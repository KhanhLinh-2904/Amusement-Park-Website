const express = require("express");
const { constantController } = require("../../controllers");
const auth = require("../../middlewares/auth");

const router = express.Router();
router.get("/", constantController.getAllConstant);
router.patch("/", auth.verifyAdmin, constantController.updateConstant);

module.exports = router;