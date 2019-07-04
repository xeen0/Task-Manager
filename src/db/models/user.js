const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./tasks')


const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Invalid Email address')
            }
        }

    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        validate(value) {
            if (value.includes("password"))
                throw new Error('Password cannot be \"Password\"')
        }
    },
    avatar :{
        type:Buffer
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
   
},{
    timestamps:true
})

UserSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

UserSchema.methods.getToken = async function () {
    var token = jwt.sign({ _id: this._id.toString() }, process.env.passphrase)
    this.tokens = this.tokens.concat({ token })
    await this.save()
    return token
}
UserSchema.methods.toJSON = function () {
    const userObject = this.toObject()
    delete userObject.password
    delete userObject.tokens
    delete userObject._id

    return userObject
}


UserSchema.statics.findByCredentials = async (email, password) => {
    var user = await User.findOne({ email })
    if (!user)
        throw new Error("unable to Login")
    var isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch)
        throw new Error("Unable to Login")
    return user
}

UserSchema.pre('save', async function (next) {
    if (this.isModified('password'))
        this.password = await bcrypt.hash(this.password, 8)
    next()
})
UserSchema.pre('remove' , async function(next){
    Task.deleteMany({onwer : this._id})

    next();
})


const User = mongoose.model('User', UserSchema)

module.exports = User