const catchAsync = require("./errControler").catchAsync
const Tour = require("./../models/employee")
const bookingController=require("./../controllers/viewController")
const Booking=require("./../models/bookingSchema")
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
    const reviews = tour.reviews
    const guides = tour.guides
    res.status(200).render('tour', {
        title: tour.name,
        tour,
        reviews,
        guides
    })
})
const logIn = catchAsync(async (req, res, next) => {
    res.status(200).render('login', {
        title: "Log In"
    })
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
module.exports.checkAlert= (req,res,next)=>{
    console.log(req.query)
        const alert= req.query.alert
        console.log(req.locals)
        if(alert) res.locals.alert=alert
        next()
}
module.exports.tour = tour
module.exports.base = base
module.exports.overview = overview
module.exports.logIn = logIn
module.exports.getMe = getMe
module.exports.bookedTours=bookedTours