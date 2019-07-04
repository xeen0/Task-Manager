const express = require('express')
const Task = require('../db/models/tasks')
const auth = require('../middle-wares/auth')

const router = new express.Router()


router.post('/tasks',auth ,async (req, res) => {
    var task = new Task({
        ...req.body,
        owner:req.user._id
    })
    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(500).send(e)
    }
})



router.get('/tasks/:name',auth ,async (req, res) => {
    var name = req.params.name
    try {
        var name = await Task.findOne({description:name , owner:req.user._id})
        if (!name)
            return res.status(404).send()
        res.send(name)
    }catch(e){
        res.status(500).send(e)
    }
})
router.get('/tasks',auth ,async (req, res) => {
    try {
        const match = {}
        if(req.query.completion){
            match.completion = req.query.completion === 'true'
        }
        await req.user.populate({
            path:'tasks',
            match,
            options:{
                limit:parseInt(req.query.limit),
                skip : parseInt(req.query.skip)
            }
                

        }).execPopulate()
        res.send(req.user.tasks)
    } catch (e) {
        res.status(500).send(e)
    }

})



router.patch('/tasks/:description',auth,async (req,res)=>{
    var updates = Object.keys(req.body);
    var validUpdates = ["completion" ,"description"]
    var valid = updates.every((update) => validUpdates.includes(update))
    if(!valid)
        return res.send("Invalid Option for update")
        try{
            var task = await Task.findOne({"description" : req.params.description,"owner":req.user._id})
            updates.forEach((update) => task[update] = req.body[update])
            task.save()
            res.send(task)
        }catch(e){
            res.status(500).send(e)
        }
    })

    router.delete('/tasks/:name',auth ,async (req,res)=>{
        try{
        const task =await Task.findOneAndRemove({description : req.params.name , owner:req.user._id})
         if(!task){
          return  res.status(404).send("Task not found")
        }
        res.send("task removed sucessfully!!!")
    }catch(e){
            res.status(404).send("task is not found")
        }
    })

    module.exports = router
