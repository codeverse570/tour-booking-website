const mongoose= require("mongoose")
const bookingSchema= new mongoose.Schema({
    tour:{
        type: mongoose.Schema.ObjectId,
        ref:'Tours',
        required:[true,"booking must belong to a tour"]
    },
    user:{
        type:mongoose.Schema.ObjectId,
        ref:"user",
        required:[true,"booking must belong to a user"]
    },
    price:{
        type: Number,
        required:[true,"booking must have a price"]
    },
    createdAt:{
        type:Date,
        default:Date.now()
    },
    paid:{
        type:Boolean,
        default:true

    }
})
bookingSchema.pre(/^find/,function(next){
    this.populate({
        path:"tour"
    })
    next()
})
const booking = new mongoose.model('booking',bookingSchema)
module.exports= booking