const express = require("express");
const { gameController } = require("../../controllers");
const auth = require("../../middlewares/auth");
const upload = require("../../utils/multer");

const router = express.Router();
router.delete("/remove", gameController.deleteActual);
router.get("/", gameController.getAllGame);
router.post("/", auth.verifyAdmin, upload.single("image"), gameController.createGame);
router.patch("/:id", auth.verifyAdmin, upload.single("image"), gameController.updateGame);
router.delete("/:id", auth.verifyAdmin, gameController.deleteGame);

module.exports = router;
