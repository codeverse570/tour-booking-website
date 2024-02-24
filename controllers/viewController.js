const catchAsync = require("./errControler").catchAsync
const Tour = require("./../models/employee")
const bookingController=require("./../controllers/viewController")
const Review=require("./../models/reviewSchema")
const User=require("./../models/userSchema")
const Booking=require("./../models/bookingSchema")
const crypto =require("crypto")
const appError= require("./../utils/appError")
const overview = catchAsync(async (req, res, next) => {
    const tours = await Tour.find();
    res.status(200).render('overview', {
        title: "overview",
        tours,
        description: 'hello from the other side'
    })
})
const base = (req, res, next) => {
    res.status(200).render('base', {
        tour: "forest hiker",
        description: 'hello from the other side'
    })
}
const tour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findOne({ slug: req.params.name }).populate('reviews')
    let bookedTour=false;
    // console.log(tour,res.locals.user)
    let review;
    if(res.locals.user){
     bookedTour = await Booking.findOne({tour:tour._id,user:res.locals.user._id})
      review= await Review.findOne({user:res.locals.user._id,tour:tour._id})
    }

    if(bookedTour) bookedTour=true
    let reviewEligible=bookedTour&&(Date.now()>=tour.startDates[tour.startDates.length-1].getTime()+24*60*60*1000)
    const reviews = tour.reviews
    const guides = tour.guides
    res.status(200).render('tour', {
        title: tour.name,
        tour,
        bookedTour,
        reviewEligible,
        reviews,
        review,
        guides
    })
})
const logIn = catchAsync(async (req, res, next) => {
    console.log("entering")
    res.status(200).render('login', {
        title: "Log In"
    })
    console.log("exiting")
})
const getMe = catchAsync(async (req, res, next) => {
    res.status(200).render('user', {
        title: "user account"
    })
})
const bookedTours=catchAsync(async(req,res,next)=>{
    const booked=await Booking.find({user:req.user._id})
     const tours= booked.map((el)=>el.tour)

    if(booked)
     res.status(200).render('overview',{
    title:"my-tours",
         tours
     })
     else{
        return next(new appError("No booked Tours! book one now"))
     }
})
module.exports.resetPassword = catchAsync(async(req,res,next)=>{
     const token= req.params.token
     const hashtoken = crypto.createHash('sha256').update(token).digest("hex")
     const user = await User.findOne({ resetPasswordToken: hashtoken })
     if(!user) return next(new appError("failed", "invalid token"))
     const currentDate = Date.now()
     if (currentDate > user.resetTokenExpiresAt) {
        return next(new appError("Failed", "Link is expired please try again"))
     }
    res.status(200).render("resetpass",{
      title:"Reset Password",
      token
   })
})
module.exports.getForgetPassPage= (req,res,next)=>{
    res.status(200).render("forgetpass",{
        title:"Forget Password"
    })
}
module.exports.checkAlert= (req,res,next)=>{
    
        const alert= req.query.alert
        console.log(req.locals)
        if(alert) res.locals.alert=alert
        next()
}
module.exports.getStats = catchAsync(async(req,res,next)=>{
    let monthly = await Tour.aggregate([
        {
          $unwind: "$startDates"
        },
        {
          $group: {
            _id: { $month: "$startDates" },
            totalRatings:{$sum:"$ratingsQuantity"},
            count: { $sum: 1 },
            tours: { $push: "$name" }
          }
        }
        ,
        {
          $sort: {
            _id: 1
          }
        }
    
      ]
      )
      let totalTours= await Tour.estimatedDocumentCount();
      let bookingStats =await Booking.aggregate([{
        $group:{
            _id:null,
            count:{$sum:1},
            revenue:{$sum:"$price"}
        }
      }])
      let topTours =await Tour.find().select("name ratingAverage").sort("-ratingAverage").limit(8)
      res.status(200).render("admin",{
        user: res.locals.user,
        totalTours,
        bookingStats,
        topTours,
        monthly
      })
})
module.exports.signUp= catchAsync(async (req, res, next) => {
    res.status(200).render('signup', {
        title: "create account"
    })
})
module.exports.tour = tour
module.exports.base = base
module.exports.overview = overview
module.exports.logIn = logIn
module.exports.getMe = getMe
module.exports.bookedTours=bookedTours