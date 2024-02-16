const express = require("express")
const authController = require("./../controllers/authControler")
const viewController = require("./../controllers/viewController")
const bookingController=require("./../controllers/bookingControler")
const router = express.Router()
router.use(authController.isLogIn)
router.get("/tour/:name", viewController.tour)
router.get("/",viewController.overview)
router.get("/login", viewController.logIn)
router.get("/signup",viewController.signUp)
router.get("/mytours",authController.checkLog,viewController.checkAlert,viewController.bookedTours)
router.get("/me", authController.checkLog, authController.isLogIn, viewController.getMe)


module.exports = router