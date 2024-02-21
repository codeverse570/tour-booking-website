const Tour = require("./../models/employee")
const catchAsync = require("./errControler").catchAsync
const stripe = require("stripe")(process.env.STRIPE_API_KEY)
const Booking = require("./../models/bookingSchema")
const factory = require("./../controllers/factoryController")
const User = require("../models/userSchema")
const htmlToPdf = require("puppeteer")
const pug = require('pug')
const fs=require("fs")
const appError=require("./../utils/appError")
const getPaymentSession = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.tourId)
  const product = await stripe.products.create({
    name: `${tour.name} Tour`,
    description: tour.summary,
    images: [`${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`],
  });

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: tour.price * 100,
    currency: 'usd',
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/mytours?alert=booking`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    mode: 'payment',
    line_items: [
      {
        price: price.id,
        quantity: 1,
      },
    ],
  });
  res.json({
    message: "success",
    session
  })
})
const createBooking = async (data) => {

  const tour = data.client_reference_id
  const price = data.amount_total / 100
  let user = (await User.findOne({ email: data.customer_email }))
  console.log("tour", tour)
  console.log("price", price)
  user = user._id
  if (tour && user && price) {
    const booking = await Booking.create({
      tour,
      user,
      price
    })

  }
}
const checkOut = catchAsync(async (req, res, next) => {
  //  console.log("entering checkout")
  const signature = req.headers["stripe-signature"]
  console.log(signature, process.env.STRIPE_WEBHOOK_SECRET, req.body)
  const event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET)
  //  console.log(process.env.STRIPE_WEBHOOK_SECRET)
  //  console.log("events ",event)
  if (event.type === "checkout.session.completed") {
    // console.log("object ",event.data.object)
    createBooking(event.data.object)
  }
  res.status(200).json({
    recieved: "done"
  })
})
module.exports.downloadInvoice = catchAsync(async (req, res, next) => {
    const browser = await htmlToPdf.launch()
    const page = await browser.newPage()
    const booking = await Booking.findOne({user:res.locals.user._id,tour:req.params.id})
    const user=res.locals.user._id
    if(!booking) return new appError("failed","No invoice found!")
    const logo=fs.readFileSync(`${__dirname}/../public/img/favicon.png`).toString('base64')
    const html = pug.renderFile(`${__dirname}/../views/invoice.pug`, {
      logo,
      booking
    })
    await page.setContent(html)
    await page.emulateMediaType("screen")
    await page.pdf({
      path: `invoice-${res.locals.user._id}-${booking.tour.slug}.pdf`,
      format: "LETTER",
      printBackground: true
    })
    await browser.close()
     res.download(`${__dirname}/../invoice-${user._id}-${booking.tour.slug}.pdf`,`invoice-${user._id}-${booking.tour.slug}.pdf`,function(err){
      if(err){
        console.log(err)
      }
      else{
        fs.unlinkSync(`${__dirname}/../invoice-${user._id}-${booking.tour.slug}.pdf`)
      }
     })
    //  console.log("jel")
}
)
module.exports.createOffBookings = factory.createDoc(Booking)
module.exports.updateBookings = factory.updateDoc(Booking)
module.exports.deleteBookings = factory.deleteDoc(Booking)
module.exports.getAllBookings = factory.getAll(Booking)
module.exports.getPaymentSession = getPaymentSession
module.exports.createBooking = createBooking
module.exports.checkOut = checkOut