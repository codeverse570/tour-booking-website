const Tour= require("./../models/employee")
const catchAsync=require("./errControler").catchAsync
const stripe=require("stripe")(process.env.STRIPE_API_KEY)
const Booking=require("./../models/bookingSchema")
const factory=require("./../controllers/factoryController")
const getPaymentSession= catchAsync(async(req,res,next)=>{
         const tour= await Tour.findById(req.params.tourId)
        //  console.log(stripe)
        console.log(tour)
        const product = await stripe.products.create({
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
          });
         
          const price = await stripe.prices.create({
            product: product.id,
            unit_amount: tour.price * 100,
            currency: 'usd',
          });
         
          const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user._id}&price=${tour.price}`,
            cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
            customer_email: req.user.email,
            client_reference_id: req.params.tourID,
            mode: 'payment',
            line_items: [
              {
                price: price.id,
                quantity: 1,
              },
            ],
          });
         res.json({
            message:"success",
            session
         })
})
const createBooking= catchAsync(async(req,res,next)=>{
  const {tour,user,price}= req.query
  console.log(req.query)
   if(tour&&user&&price){
       const booking=  await Booking.create({
          tour,
          user,
          price
         })
         console.log(booking)
   }
  next();
})
module.exports.createOffBookings= factory.createDoc(Booking)
module.exports.updateBookings=factory.updateDoc(Booking)
module.exports.deleteBookings=factory.deleteDoc(Booking)
module.exports.getAllBookings=factory.getAll(Booking)
module.exports.getPaymentSession= getPaymentSession
module.exports.createBooking = createBooking