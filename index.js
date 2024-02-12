const dotenv = require('dotenv')
const express = require("express")
dotenv.config({ path: './config.env' })
const fs = require('fs');
const rateLimiter = require('express-rate-limit')
const morgan = require("morgan");
const app = express();
const appError = require("./utils/appError")
const Employeeroute = require("./Routes/Tours")
const path = require('path')
const reviewroute = require('./Routes/review')
const Userroute = require("./Routes/User")
const bookingroute=require("./Routes/booking")
const mongoose = require('mongoose')
const errorHandler = require('./controllers/errControler').errorHandler
const helmet = require("helmet")
const viewsroute = require("./Routes/view")
const multer=require("multer")
const sanitize = require("express-mongo-sanitize")
const cookieparse = require("cookie-parser")
const xss = require("xss-clean")
const hpp = require("hpp")
const compression= require("compression")

app.use(express.json({ limit: '10kb' }))
app.use(cookieparse())
app.use(sanitize())
app.use(helmet())
app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'", 'data:', 'blob:', 'https:', 'ws:'],
          baseUri: ["'self'"],
          fontSrc: ["'self'", 'https:', 'data:'],
          scriptSrc: [
            "'self'",
            'https:',
            'http:',
            'blob:',
            'https://*.mapbox.com',
            'https://js.stripe.com',
            'https://m.stripe.network',
            'https://*.cloudflare.com',
          ],
          frameSrc: ["'self'", 'https://js.stripe.com'],
          objectSrc: ["'none'"],
          styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
          workerSrc: [
            "'self'",
            'data:',
            'blob:',
            'https://*.tiles.mapbox.com',
            'https://api.mapbox.com',
            'https://events.mapbox.com',
            'https://m.stripe.network',
          ],
          childSrc: ["'self'", 'blob:'],
          imgSrc: ["'self'", 'data:', 'blob:'],
          formAction: ["'self'"],
          connectSrc: [
            "'self'",
            "'unsafe-inline'",
            'data:',
            'blob:',
            'https://*.stripe.com',
            'https://*.mapbox.com',
            'https://*.cloudflare.com/',
            'https://bundle.js:*',
            'ws://127.0.0.1:*/',
   
          ],
          upgradeInsecureRequests: [],
        },
      },
    })
  );
  
app.use(morgan("tiny"))
app.use(xss())
app.use(hpp({
    whitelist: ["duration"]
}))

// console.log(process.env.DATABASE) 
const limiter = rateLimiter({
    max: 30,
    windowMs: 60 * 60 * 1000,
    message: "Too many requests please try later"
})
app.use('/api', limiter)
app.set("view engine", "pug")
app.set("views", path.join(__dirname, "views"))
app.use(express.static(path.join(__dirname, 'public')))
app.use(compression())
const { MongoClient, ServerApiVersion } = require('mongodb');
const CookieParser = require('cookieparser');
const uri = "mongodb+srv://patel36:neeraj@cluster0.gblkjv7.mongodb.net/?retryWrites=true&w=majority";

mongoose.connect("mongodb+srv://patel36:neeraj@cluster0.gblkjv7.mongodb.net/?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(con => {
    // console.log(con)
    console.log("DB connection successful")
})
// check
app.use('/', viewsroute)
app.use('/api/user', Userroute);
app.use('/api/review', reviewroute);
app.use('/api/booking',bookingroute)
app.use('/api/employee', Employeeroute);
app.all("*", (req, res, next) => {
    const err = new appError(404, `${req.originalUrl} is not valid route`)
    next(err)
})
app.use(errorHandler)
const port= process.env.port||3000
app.listen(port, () => {
    console.log("app is started");
}) 