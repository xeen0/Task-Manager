const express = require('express')
const User = require('../db/models/user')
const auth = require('../middle-wares/auth')
const multer = require('multer')
const router = new express.Router()
const sharp = require('sharp')
const email = require('../../emails/accout')

var upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(png)$/))
            return cb(new Error("Only png is allowed"))
        cb(null, true)
    }
})


router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    // req.user.avatar = req.file.buffer // here we are using above metioned comment
    const buffer = await sharp(req.file.buffer).resize({width : 250 , height:250}).png().toBuffer() //sharp =>converts and resizes
    req.user.avatar = buffer
    await req.user.save()
    res.send("Done Uploading")
}, (err, req, res, next) => {
    res.status(400).send({ error: err.message })
})
router.post('/users/signup', async (req, res) => {
    var user = new User(req.body);
    try {
        email.sendWelcomeMail(user.email , user.name)
        await user.getToken()
        res.status(201).send(user)
    } catch (e) {
        res.status(400).send(e)
    }

})
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.getToken()
        res.send({ user, token })
    } catch (e) {
        res.status(400).send("Unable to Login")
    }
})
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
        res.send("LoggedOut")
    } catch (e) {
        res.status(500).send()
    }
})
router.post('/users/logout/all', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send("Logged out of all devices")
    } catch (e) {
        res.status(500).send()
    }
})



router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})
router.get('/users/:id/avatar'  , async(req,res) =>{
    const user =await User.findById(req.params.id);
    try{
        if(!user || !user.avatar)
            throw new Error()
            res.set('Content-Type', 'image/png' )        
            res.send(user.avatar)    
    }catch(e){
        res.status(500).send("Error")
    }
})

router.patch('/users/me', auth, async (req, res) => {
    var updates = Object.keys(req.body)
    var validUpdates = ["name", "age", "email", "password"]
    var valid = updates.every((update) => validUpdates.includes(update))
    if (!valid)
        return res.send("Invalid Option")
    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.delete('/users/me', auth, async (req, res) => {
    try {
        email.sendFeedbackMail(user.email , user.name)
        await req.user.remove()
        res.send("User Deleted")
    } catch (e) {
        res.status(500).send(e)
    }
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    try {
        await req.user.save()
        res.send("Avatar Deleted")
    } catch (e) {
        res.status(500).send(e)
    }
})


module.exports = router