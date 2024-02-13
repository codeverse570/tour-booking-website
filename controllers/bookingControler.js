const Tour= require("./../models/employee")
const catchAsync=require("./errControler").catchAsync
const stripe=require("stripe")(process.env.STRIPE_API_KEY)
const Booking=require("./../models/bookingSchema")
const factory=require("./../controllers/factoryController")
const User = require("../models/userSchema")
const getPaymentSession= catchAsync(async(req,res,next)=>{
         const tour= await Tour.findById(req.params.tourId)
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
            success_url: `${req.protocol}://${req.get('host')}/my-tour`,
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
const createBooking= async(data)=>{
  
  const tour= data.client_reference_id
  const price=data.unit_amount/100
  const user= (await User.findOne({email:data.customer_email}))
  console.log(tour,price,user)
  user=user._id
   if(tour&&user&&price){
       const booking=  await Booking.create({
          tour,
          user,
          price
         })
        
   }
}
const checkOut =catchAsync(async(req,res,next)=>{
           const signature=req.headers["stripe-signature"]
           const event= stripe.webhooks.constructEvent(req.body,signature,process.env.STRIPE_WEBHOOK_SECRET)
           if(event.type==="checkout.session.completed"){
                   createBooking(event.data.object)
           }
           
           

})
module.exports.createOffBookings= factory.createDoc(Booking)
module.exports.updateBookings=factory.updateDoc(Booking)
module.exports.deleteBookings=factory.deleteDoc(Booking)
module.exports.getAllBookings=factory.getAll(Booking)
module.exports.getPaymentSession= getPaymentSession
module.exports.createBooking = createBooking
module.exports.checkOut=checkOut