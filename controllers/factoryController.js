const appError = require("../utils/appError");
const apiFeatures=require("../utils/apiFeatures")
const catchAsync=require("./errControler").catchAsync
const deleteDoc=model=>catchAsync(async (req,res)=>{
    
    let id= req.params.id;
     await model.findByIdAndDelete(
    id
     )
     res.status(201).json({
         message:"success",
         data:null
     })
}
)
const updateDoc= model=>catchAsync(async(req,res,next)=>{
    const Doc= await  model.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidator:true
     })
     if(Doc)
     res.status(200).json({
        status:"success",
        data:{
            Doc
        }
     })
     else return next(new appError("failed","No doc found with Id"))
 
})
const createDoc= model=>  catchAsync(async (req, res) => {

    const Doc=await model.create(req.body)
     res.status(200).json({
         message:"success",
         data: Doc
     })
   
 
 }
 )
 const getOne= (model,popOptions)=> catchAsync(async (req, res,next) => {
    let id = req.params.id;

    let query =   model.findById(id)
    if((popOptions)) query.populate(popOptions)
    let doc= await query
    if (doc) {
       res.json({
            message:"SUCCESS",
            data: doc
        })
    }
    else {
         next(new appError("failed","doc with given Id not found")) 
    }
}
)
const getAll= (model)=>catchAsync(async (req, res,next) => {
    
    let Doc=new apiFeatures(model.find(),JSON.stringify(req.query)).filter().sort().fields().paging()
    Doc=await Doc.tours 
   
if(Doc.length!=0) res.status(200).json(
     {   length: Doc.length,
         message: "success",
         data:Doc
     }
 );
else  next(new appError("failed","NO Doc find with given parameters"))
 
}
)
module.exports.createDoc=createDoc
module.exports.deleteDoc=deleteDoc
module.exports.updateDoc=updateDoc
module.exports.getOne=getOne
module.exports.getAll=getAll