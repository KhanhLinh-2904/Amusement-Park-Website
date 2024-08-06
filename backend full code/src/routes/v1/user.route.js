const express = require("express");
const upload = require("../../utils/multer");
const auth = require("../../middlewares/auth");
const userController = require("../../controllers/user.controller");

const router = express.Router();
router.patch("/profile", upload.single("avatar"), userController.updateProfile);
router.route("/").post(userController.createUser).get(auth.verifyAdmin, userController.getUsers);
router
  .route("/:userId")
  .get(auth.verifyAdmin, userController.getUser)
  .patch(auth.verifyAdmin, auth.verifyPassword, userController.updateUser)
  .delete(auth.verifyAdmin, userController.deleteUser);

module.exports = router;
