const mongoose = require("mongoose")
const Tour=require("./employee")
const reviewS = new mongoose.Schema({
    review: {
        type: String,
        required: [true, "write some review"]
    },
    rating: {
        type: Number,
        required: [true, "please write the rating"]
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'user',
        required: [true, "review must belong to user"]
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: "Tours",
        required: [true, "review must belong to tour"]
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})
reviewS.index({tour:1,user:1},{unique:true})
reviewS.statics.calcAvg = async function (tourId) {
    
    const stats = await this.aggregate([
        {
            $match:
            {
                tour: mongoose.Types.ObjectId(tourId)
            }
        },
        {
            $group: {
                _id: "$tour",
                avgRating: { $avg: "$rating" },
                totalRatings: { $sum: 1 }
            }
        }
    ])
if(stats.length)  await Tour.findByIdAndUpdate(tourId,{
        ratingQuantity:stats[0].totalRatings,
        ratingAverage:stats[0].avgRating
    })
else{
    await Tour.findByIdAndUpdate(tourId,{
        ratingQuantity:0,
        ratingAverage:4.5
    })
}
   

}
reviewS.pre(/^find/, function (next) {
    this.populate({
        path: "user",
        select: "name photo email"
    })
    next()
})
reviewS.pre(/^findOneAnd/,async function(next){
      this.review= await this.findOne() 

      next()
})
reviewS.post(/^findOneAnd/,async function(next){
        this.review.constructor.calcAvg(this.review.tour)
})
reviewS.post("save",function(){
    
    this.constructor.calcAvg(this.tour)
})
const Review = mongoose.model('review', reviewS)
module.exports = Review