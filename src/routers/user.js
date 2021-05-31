const express = require("express")
const User=require('../models/user')
const auth = require('../middleware/authentication')
const router = require('express').Router()
const multer =  require('multer')
const sharp= require('sharp')
const { sendWelcomeEmail, sendCancelationEmail} = require('../emails/account')
// To  Create new users 
router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save();
        sendWelcomeEmail(user.email,user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (error) {
        res.status(400).send(error)
    }

    // user.save().then(()=>{
    //     res.send(user) // User.find({}).then( (users)=>{
    //     res.send(users)
    // }).catch((e)=>{
    //     res.status(500).send("Unable to fetch details from database"+e)
    // })
    // }).catch((e)=>{
    //     res.status(400).send('Unable to store data: '+e)
    // })
})



//Login
router.post('/users/login',async(req,res)=>{
    try{
        const user = await User.findByCredentials(req.body.email.trim().toLowerCase(),req.body.password.trim())
        const token =await user.generateAuthToken()
        res.send({user,token})
    }
    catch(E){
        res.status(400).send("Login details not found  "+E)
    }
})

router.post('/users/logout',auth,async (req,res)=>{
    try{
        req.user.tokens= req.user.tokens.filter((token)=>{
            return token.token!==req.token
        })
        await req.user.save()
        res.send()
    }
    catch(e){
        res.status(500).send()
    }
})
router.post('/users/logoutall' ,auth,async (req , res)=>{
    try {
        req.user.tokens= []
        await req.user.save()
        res.status(200).send("Logged out from all devices")
    } catch (error) {
        res.status(500).send()
    }

})



router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})



// to fetch users based on id
// router.get('/users/:id', async (req, res) => {
//     const _id = req.params.id
//     try {
//         const user = await User.findById(_id)
//         if (!user) {
//             return res.status(404).send(' Unable to find the user')
//         }
//         res.send(user)
//         next()
//     }
// catch (error) {
//         res.status(500).send(error)
//     }

//     // User.findById(_id).then((user)=>{
//     //     if(!user){
//     //         return res.status(404).send(' Unable to find the user')
//     //     }
//     //     res.send(user)
//     // }).catch((E)=>{
//     //     res.status(500).send("Unable to find the user"+E)
//     // })

// })


// to update users based on id
router.patch('/users/me', auth,async (req, res) => {

    const updates = Object.keys(req.body)
    const allowedupdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => {
        return allowedupdates.includes(update)
    })

    if (!isValidOperation) {
        return res.status(400).send(" Error invalid updates")
    }
    try {
        // const user = await User.findById(req.user._id)
        
        updates.forEach((update)=> req.user[update]=req.body[update])

        await req.user.save()
       // const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
       
        // if (!user) {
        //     return res.status(404).send("Unable to find user")
        // }
        res.send(req.user)
    } 
    catch (error) {
        res.status(400).send("Error 400 " + error)
    }

})

// to delete users based on id
router.delete('/users/me',auth ,async (req, res) => {
    try {

        // const user = await User.findByIdAndDelete(req.user._id)

        // if (!user) {
        //     return res.status(404).send("NOt a valid id")
        // }
        sendCancelationEmail(req.user.email,req.user.name)
        await req.user.remove()
        res.send(req.user)
    } catch (error) {
        res.status(500).send(error)
    }

})


const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload an image'))
        }
        cb(undefined, true)
    }
})

router.post('/users/me/avatar', auth,upload.single('avatar'),async (req, res) => {
    const buffer =  await sharp(req.file.buffer).resize({ width:250, height:250 }).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.delete('/users/me/avatar', auth, async (req, res) => {
 
    req.user.avatar= undefined
    await req.user.save()

    res.status(200).send("Deleted your avathar")
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})


router.get('/users/:id/avatar',async (req,res)=>{
    try {
        const user= await User.findById(req.params.id)
           if(!user || !user.avatar){
            throw new Error()
        }

    res.set('Content-Type', 'image/png')
    res.send(user.avatar)
   
    } catch (error) {
        console.log("error");   
        res.status(404).send(error)
    }
})


module.exports  = router