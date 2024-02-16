const User = require("./../models/userSchema")
const jwt = require("jsonwebtoken")
const appError = require("./../utils/appError")
const { promisify } = require("util")
const apiFeatures = require("./../utils/apiFeatures")
const catchAsync = require("./../controllers/errControler").catchAsync
const Email = require("./../utils/email")
const crypto = require("crypto")
const signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body)
  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN
  })
  res.cookie('jwt', token, {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    secure: true,
    httpOnly: true
  })
  await new Email(newUser, `http://127.0.0.1:3000/me`).sendWelcomeEmail();
  res.status(201).json({
    message: "success",
    token,
    data: newUser
  })
}
)
const logIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body
  if (!email || !password) {
    next(new appError("failed", "Please Enter Email or Password"))
  }
  else {
    const user = await User.findOne({ email }).select("+password")
    if (!user) next(new appError("failed", "Email does not exist!"))
    const correct = user.correctPassword(user.password, password)


    if (user && await correct) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRES_IN
      })
      res.cookie('jwt', token, {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        secure: true,
        httpOnly: true
      })
      res.status(201).json({
        message: "success",
        token,
        data: user
      })
    }
    else {
      res.status(401).json({
        message: "wrong password or email",

      })
    }
  }
}
)

const checkLog = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {

    token = req.headers.authorization.split(" ")[1]
  }
  else if (req.cookies.jwt) {
    token = req.cookies.jwt
  }

  if (token) {
    const payload = await promisify(jwt.verify)(token, process.env.JWT_SECRET_KEY)
    const newUser = await User.findOne({ _id: payload.id })
    if (newUser) {

      req.user = newUser
      if (!newUser.isPassUpdate(payload.iat)) next()
      else next(new appError("failed", "Password is Changed please log in again!"))
    }
    else {
      next(new appError("failed", "User Not Found"))
    }

  }
  else {
    next(new appError("failed", "you are not logged in please log in to get access"))
  }

}
)
const isLogIn = catchAsync(async (req, res, next) => {
  let token;
  if (req.cookies.jwt) {
    token = req.cookies.jwt
  }
  if (!token) return next()
  const payload = await promisify(jwt.verify)(token, process.env.JWT_SECRET_KEY)
  const newUser = await User.findOne({ _id: payload.id })

  if (!newUser) return next()
  if (newUser.isPassUpdate(payload.iat)) return next()
  res.locals.user = newUser
  next()

}
)
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (roles.includes(req.user.role)) {
      next()
    }
    else {
      return next(new appError("failed", "You are not authorized to delete this tour"))
    }
  }
}
const forgetPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body
  const user = await User.findOne({ email })
  if (!user) next(new appError("failed", "No such User found"))
  const token = user.generateResetPasswordToken()


  const resetUrl = `${req.protocol}://${req.hostname}:3000/api/user/resetpassword/${token}`
  try {
    await new Email(user, resetUrl).sendResetPassword()
    res.status(200).json({
      status: "success",
      message: "Reset your password using the link"
    })
  }
  catch (err) {
    console.log(err)
    user.resetPasswordToken = undefined
    user.resetTokenExpiresAt = undefined

    res.json({
      status: "failed",
      message: "something went wrong please try again"
    })
  }
  user.save({ validateBeforeSave: false })
})
const resetPassword = catchAsync(async (req, res, next) => {
  const { currentPassword, password, passwordConfirm } = req.body
  const token = req.params.token
  const hashtoken = crypto.createHash('sha256').update(token).digest("hex")
  // if(password!=passwordConfirm) next(new appError("failed","please confirm password carefully!"))
  const user = await User.findOne({ resetPasswordToken: hashtoken })
  if (!user) {
    next(new appError("failed", "invalid token"))
  }
  const currentDate = Date.now()
  if (currentDate > user.resetTokenExpiresAt) {
    next(new appError("Failed", "Link is expired please try again"))
  }
  if (!password) next(new appError("failed", "please provide password"))
  user.password = password
  user.passwordConfirm = passwordConfirm
  const jwttoken = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN
  })
  await user.save()
  res.cookie('jwt', jwttoken, {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    secure: true,
    httpOnly: true
  })
  res.json({
    status: "success",
    jwttoken
  })


})
const changePassword = catchAsync(async (req, res, next) => {
  let token;
  const { currentPassword, password, passwordConfirm } = req.body
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1]
  }
  else if (req.cookies.jwt) {
    token = req.cookies.jwt
  }
  if (token) {
    const payload = await promisify(jwt.verify)(token, process.env.JWT_SECRET_KEY)
    const newUser = await User.findOne({ _id: payload.id }).select('+password')
    if (newUser) {
      req.user = newUser
      const correct = await newUser.correctPassword(newUser.password, currentPassword)
      if (!correct) next(new appError("failed", "current password is not correct!"))
      if (!newUser.isPassUpdate(payload.iat)) {
        newUser.password = password
        newUser.passwordConfirm = passwordConfirm

        await newUser.save()
        res.status(200).json({
          message: "success",
          data: newUser
        })
      }
      else next(new appError("failed", "Password is Changed please log in again!"))
    }
    else {
      next(new appError("failed", "User Not Found"))
    }

  }
  else {
    next(new appError("failed", "you are not logged in please log in to get access"))
  }
})
const logOut = (req, res, next) => {
  res.cookie('jwt', "", {
    expires: new Date(Date.now() + 10000),
    secure: true,
    httpOnly: true
  })
  res.json({
    status: "success"
  })
}
module.exports.logOut = logOut
module.exports.signUp = signUp
module.exports.logIn = logIn
module.exports.checkLog = checkLog
module.exports.restrictTo = restrictTo
module.exports.forgetPassword = forgetPassword
module.exports.resetPassword = resetPassword
module.exports.isLogIn = isLogIn
module.exports.changePassword = changePassword