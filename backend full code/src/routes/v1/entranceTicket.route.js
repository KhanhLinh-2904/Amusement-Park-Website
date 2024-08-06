const express = require("express");
const { entranceTicketController } = require("../../controllers");
const auth = require("../../middlewares/auth");

const router = express.Router();

router.get("/", entranceTicketController.getTicket);
// router.get("/:id", auth.verifyStaff, entranceTicketController.getByParam);
router.post("/", auth.verifyStaff, entranceTicketController.createTicket);
router.patch("/", entranceTicketController.updateTicket);
router.patch("/vip", entranceTicketController.updateVipTicket);
router.patch("/payment", auth.verifyStaff, entranceTicketController.payTicket);
router.patch("/payment/vip", entranceTicketController.payVip);
// router.delete("/:ticketId", entranceTicketController.deleteTicket);
router.post("/vip", entranceTicketController.createTicketForVip);
module.exports = router;
