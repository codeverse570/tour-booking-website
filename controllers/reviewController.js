const Review=require('./../models/reviewSchema')
const catchAsync=require('./errControler').catchAsync
const apiFeatures=require('./../utils/apiFeatures')
const appError=require('./../utils/appError')
const factoryController=require("./factoryController")
const setParaReview=(req,res,next)=>{
  req.body.email=req.user.email
            req.body.user= req.user._id
            if(!req.body.tour) req.body.tour= req.params.tourId
            next()
}
const createReview=factoryController.createDoc(Review)
const getReview = factoryController.getAll(Review)
const deleteReview= factoryController.deleteDoc(Review)
module.exports.createReview=createReview
module.exports.getReviews=getReview
module.exports.getReviewById=factoryController.getOne(Review,{path:"user tour",select:"name"})
module.exports.deleteReview=deleteReview
module.exports.updateReview=factoryController.updateDoc(Review)
module.exports.setParaReview=setParaReview