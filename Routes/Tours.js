const express = require('express')
const employee = require('../controllers/tourController')
const authControler = require("../controllers/authControler")
const review=require(".././Routes/review")
const route = express.Router();
route.route('/getMonthlyPlan/:year').get(authControler.checkLog,employee.montlyPlans)
route.route('/getTourStats').get(employee.tourStats)
route.route('/tour-within/:distance/center/:cord/unit/:unit').get(employee.tourWithin)
route.route('/distances/center/:cord/unit/:unit').get(employee.distances)
route.route('/').get( employee.getEmployee).post(employee.addEmployee)
route.route('/:id').patch(authControler.checkLog,authControler.restrictTo("admin","lead-guide"),employee.uploadPhoto,employee.resizeTourImages,employee.updateEmployee)
route.route('/:id').delete(authControler.checkLog, authControler.restrictTo('admin', 'lead-guide'), employee.deleteTour)
route.route('/:id').get(employee.getByName)
route.use('/:tourId/reviews',review)
module.exports = route
