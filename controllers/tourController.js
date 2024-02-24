const { query } = require("express");
const employee = require("../models/employee")
const catchAsync = require("./errControler").catchAsync
const apiFeatures = require("./../utils/apiFeatures");
const appError = require("../utils/appError");
const factoryController = require("./factoryController");
const Tours = require("../models/employee");
const sharp = require("sharp")
const multer = require("multer")
const multerStorage = multer.memoryStorage()
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true)
  }
  else {
    cb(new appError("failed", "please upload a image!"), false)
  }
}
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
})
const uploadPhoto = upload.fields([
  { name: "imageCover", maxCount: 1 },
  { name: "images", maxCount: 3 }
])
const resizeTourImages = catchAsync(async (req, res, next) => {

  if (!req.files.images || !req.files.imageCover) return next()
  if (req.files.images.length < 3) return next(new appError("failed", "please provide atleast three images for tour"))
  let imageCoverName = `tour-${req.params.id}-${Date.now()}-cover.jpg`
  await sharp(req.files.imageCover[0].buffer).resize(2000, 1300).toFormat("jpeg").jpeg({ quality: 90 }).toFile(`public/img/tours/${imageCoverName}`)
  req.body.imageCover = imageCoverName
  let images = []
  images = await Promise.all(req.files.images.map(async (img, i) => {
    let image = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpg`
    await sharp(img.buffer).resize(1000, 700).toFormat("jpeg").jpeg({ quality: 100 }).toFile(`public/img/tours/${image}`)
    return image
  }))


  req.body.images = images
  next()
}
)

const tourStats = catchAsync(async (req, res, next) => {

  const stats = await employee.aggregate([
    {
      $match: { price: { $gte: 200 } }
    },
    {
      $group: {
        _id: "$difficulty",
        count: { $sum: 1 },
        totalRating: { $sum: "$ratingsQuantity" },
        averagePrice: {
          $avg: "$price"
        },
        maxPrice: {
          $max: "$price"
        },
        averageRating: {
          $avg: "$ratingsAverage"
        }

      }
    }
  ])

  res.json({
    length: stats.length,
    message: "success",
    data: stats
  })


}
)
const getEmployee = factoryController.getAll(employee)
const addEmployee = factoryController.createDoc(employee)
const postmiddle = (req, res, next) => {
  const emp = req.body

  if (emp.employee.salary > 100000) {
    return res.json({
      message: "bad request"
    })
  }
  next();
}

const getByName = factoryController.getOne(employee, { path: "reviews" })
const getMontlyPlan = catchAsync(async (req, res,next) => {
  let year = req.params.year * 1
  let monthly = await employee.aggregate([

    {
      $unwind: "$startDates"
    },
    {
      $group: {
        _id: { $month: "$startDates" },
        totalRatings:{$sum:"$ratingsQuantity"},
        count: { $sum: 1 },
        tours: { $push: "$name" }
      }
    }
    ,
    {
      $sort: {
        _id: 1
      }
    }

  ]
  )
  res.json({
    status: "success",
    data: monthly
  })


}
)
// '/tour-within/:distance/center/:cord/unit/:unit'
const distances = catchAsync(async (req, res, next) => {
  const [lati, longi] = req.params.cord.split(",")
  const unit = req.params.unit
  if (!longi || !lati) return next(new appError("failed", "please specify the coordinate of center"))
  const tour = await employee.aggregate([
    {
      $geoNear: {
        near: { type: "Point", coordinates: [longi * 1, lati * 1] },
        distanceField: "distance",
        distanceMultiplier: 0.001
      }
    }
  ])
  res.status(200).json({
    message: "success",
    length: tour.length,
    data: tour
  })

})
const tourWithin = catchAsync(async (req, res, next) => {
  const [longi, lati] = req.params.cord.split(',')
  const distance = req.params.distance
  const unit = req.params.unit

  let radius;
  if (unit == 'mi') {
    radius = distance / 3963.2
  } else {
    radius = distance / 6378.1
  }

  if (!longi || !lati) return next(new appError("failed", "please specify the coordinate of center"))
  const tour = await employee.find({ startLocation: { $geoWithin: { $centerSphere: [[lati, longi], radius] } } })

  res.status(200).json({
    message: "success",
    length: tour.length,
    data: tour
  })

})
module.exports.deleteTour = factoryController.deleteDoc(Tours)
module.exports.addEmployee = addEmployee
module.exports.getByName = getByName
module.exports.getEmployee = getEmployee;
module.exports.postmiddle = postmiddle
module.exports.updateEmployee = factoryController.updateDoc(Tours)
module.exports.tourStats = tourStats
module.exports.montlyPlans = getMontlyPlan
module.exports.tourWithin = tourWithin
module.exports.distances = distances
module.exports.uploadPhoto = uploadPhoto
module.exports.resizeTourImages = resizeTourImages
// module.exports.deleteTour=deleteTour