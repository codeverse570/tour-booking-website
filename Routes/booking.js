const express = require('express')
const employee = require('../controllers/tourController')
const bookingController=require("./../controllers/bookingControler")
const authControler = require("../controllers/authControler")
const review=require(".././Routes/review")
const router = express.Router();
router.route("/getpaymentsession/:tourId").get(authControler.checkLog,bookingController.getPaymentSession)
// router.use("/download-invoice/:id",bookingController.downloadInvoice)
router.use(authControler.checkLog,authControler.restrictTo("admin"))
router.route("/createbooking").post(bookingController.createOffBookings)
router.route("/getallbooking").get(bookingController.getAllBookings)
router.route("/updatebooking/:id").patch(bookingController.updateBookings)
router.route("/deletebooking/:id").delete(bookingController.deleteBookings)
module.exports = router