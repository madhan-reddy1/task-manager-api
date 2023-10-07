const express = require("express")
const Task = require('../models/task')
const auth = require('../middleware/authentication')
const router = require('express').Router()

router.post('/tasks',auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner:req.user._id
    })

    try {
        await task.save()
        res.status(201).send(task)
    } catch (error) {
        res.status(400).send("Unable to insert data: " + error)
    }

    task.save().then((tasks)=>{
        res.status(201).send(tasks)
    }).catch((e)=>{
        res.status(400).send("Unable to insert data: "+e)
    })
})

router.delete('/tasks/:id', auth,async (req, res) => {
    try {

        const task = await Task.findOneAndDelete({_id:req.params.id,owner:req.user._id})

        if (!task) {
            return res.status(404).send()
        }

        res.send(task)
    } catch (error) {
        res.status(500).send(error)
    }
})

//GET/tasks?Completed=true

//Pagination: limit and skip
//GET/tasks?limit=10&skip=10
//GET /tasks?sortBy= createdAt:desc
router.get('/tasks',auth ,async (req, res) => {
    const match={}
    const sort={}

    if(req.query.Completed){
        match.Completed= req.query.Completed ==='true'
    }
    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1]==='desc' ?-1:1
       }
    try {
        // const task = await Task.find({owner:req.user._id})
        await req.user.populate({
            path:'tasks',
            match,
            options:{
                limit:parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.status(200).send(req.user.tasks)
    } catch (error) {
        res.status(400).send(error)
    }


    // Task.find({}).then((tasks)=>{
    //     res.send(tasks)
    // }).catch((e)=>{
    //     res.status(400).send("Unable to connect server"+e)
    // })
})

router.get('/tasks/:id', auth,async (req, res) => {
    const _id = req.params.id

    try {
        const task = await Task.findOne({_id,owner: req.user._id})
        if (!task) {
            res.status(404).send()
        }
    res.status(201).send(task)
    }
    catch (error) {
        res.status(500).send("Unable to retrieve data  " + error)
    }

    // Task.findById(_id).then((tasks)=>{
    //     if(!tasks){
    //         res.send(404).send("Unable to find requested data")
    //     }
    //     res.send(tasks  )
    // }).catch((e)=>{
    //     res.status(500).send("Unable to retrieve data"+e)
})
    // })

router.patch('/tasks/:id',auth ,async (req, res) => {
    update_request = Object.keys(req.body)
    allowedupdates = ['Description', 'Completed']

    isValidOperation = update_request.every((request) => {
        return allowedupdates.includes(request)
    })

    if (!isValidOperation) {
        return res.status(400).send("Error not a valid request please check key values")
    }

    try {
        const task = await Task.findOne({_id:req.params.id,owner:req.user._id})

        // task = await Task.findById(req.params.id)

        if (!task) {
            return res.status(404).send()
        }
        
        update_request.forEach(update => {
            task[update]=req.body[update]
        });

        await task.save()
//        const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })




        res.send(task)
    }
    catch (error) {
        res.status(500).send(error)
    }

})

module.exports = router