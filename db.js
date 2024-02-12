const mongoose = require('mongoose')
const { MongoClient, ServerApiVersion } = require('mongodb');
const employee = require("./models/employee")
const User = require("./models/userSchema")
const Review = require('./models/reviewSchema')
const uri = "mongodb+srv://patel36:neeraj@cluster0.gblkjv7.mongodb.net/?retryWrites=true&w=majority";
const fs = require("fs")
const tours = fs.readFileSync("./dev-data/Tours.json")
const Users = fs.readFileSync("./dev-data/User.json")
const Reviews = fs.readFileSync("./dev-data/Review.json")
mongoose.connect("mongodb+srv://patel36:neeraj@cluster0.gblkjv7.mongodb.net/?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(con => {
    // console.log(con) 
    console.log("DB connection successful")
})
const addDB = async () => {
    await employee.deleteMany()
    await Review.deleteMany()
    await User.deleteMany()
    await employee.create(JSON.parse(tours))
    await User.create(JSON.parse(Users), { validateBeforeSave: false })
    await Review.create(JSON.parse(Reviews))
    console.log('over')
}
addDB()