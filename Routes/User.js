const express = require("express")
const auth=require("./../controllers/authControler")
const user=require("./../controllers/userControler")
const route = express.Router();
const multer=require("multer")
const upload =multer({dest:"public/img/users"})
route.route('/signup').post(auth.signUp);
route.route('/login').post(auth.logIn)
route.route('/logout').get(auth.logOut)
route.route('/forgetpassword').post(auth.forgetPassword)
route.route('/resetpassword/:token').patch(auth.resetPassword)
route.route('/changepassword').patch(auth.changePassword)
route.use(auth.checkLog)

route.route('/updateme').patch(user.uploadPhoto,user.resizeImage,user.updateMe)
route.route('/deleteme').delete(user.deleteMe)
route.route('/getme').get(user.getMe,user.getOneUser)
route.use(auth.restrictTo("admin"))
route.route('/getalluser').get(user.getAllUser)
route.route('/deleteuser/:id').delete(user.deleteUser)
route.route('/updateuser/:id').patch(user.updateUser)

module.exports = route
