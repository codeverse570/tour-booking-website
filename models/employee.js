const mongoose = require('mongoose')
const slug=require('slug')
const User = require('./userSchema')
const ToursS = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "name is required"],
        unique: true,
        minLength: [4, "name length must be greater than 4"],
        maxLength: 30
    },
    rating: {
        type: Number,
        default: 4.5,
        min: [1, "Rating must be above 1"]
    },
    duration: {
        type: Number,
        required: [true, 'Duration for tour is needed']
    },
    maxGroupSize: {
        type: Number,
        required: [true, "A tour must have a group size"]
    },
    ratingAverage: {
        type: Number,
        default: 4.5
    },
    ratingQuantity: {
        type: Number,
        default: 0
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, "A tour must have a cover image"]
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now()
    },
    priceDiscount: Number,
    startDates: [Date],
    summary: {
        type: String,
        trim: true
    },
    price: {
        type: Number,
        required: true
    },
    difficulty:{
     type:String,
     enum:["easy","medium","difficult"]
    },
    startLocation: {
        type: {
            type: String,
            default: "Point",
            enum: ["Point"]
        },
        coordinates: [Number],
        address: String,
        description: String
    },
    locations: [{
        type: {
            type: String,
            default: "Point",
            enum: ["Point"]
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
    }],
    slug:String,
    guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref: "user"
        }
    ]
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})
ToursS.index({price:1,duration:-1})
ToursS.index({startLocation:"2dsphere"})
ToursS.virtual('reviews', {
    ref: 'review',
    foreignField: 'tour',
    localField: '_id'
})
ToursS.pre("save",function(next){
  this.slug=slug(this.name)
  next()
})
ToursS.pre(/^findOne/, function (next) {
    this.populate({
        path: "guides",
        select: "-active"
    }
    )
    next()
})

const Tours = new mongoose.model('Tours', ToursS)

module.exports = Tours 