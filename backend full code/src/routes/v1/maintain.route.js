const express = require("express");
const { maintainController } = require("../../controllers");
const auth = require("../../middlewares/auth");
const upload = require("../../utils/multer");

const router = express.Router();
router.get("/", maintainController.getMaintainance);
router.post("/", auth.verifyStaff, upload.single("image"), maintainController.createMaintainace);
router.patch("/:id", upload.single("image"), maintainController.updateMaintainance);
router.post("/delete", auth.verifyAdmin, maintainController.deleteMaintainace);

module.exports = router;
