const mongoose = require('mongoose')


mongoose.connect(process.env.MONGODB_URL,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopology: true,
    useFindAndModify:false
})



// const Data = mongoose.model('Data',{
//     name:{
//          type:String,
//          trim:true
//     },
//     age:{
//         type:Number
//     },
//     Student:{
//         default:false,
//         type:Boolean
//     }
// })

// const variable= new Data({
//     name:'kiran',
//     age:23,
//     Student:false
// })

// variable.save().then(()=>{
//     console.log("Data Inserted");
//     console.log(variable)
// }).catch((e)=>{
//     console.log("Error",e);
// })


