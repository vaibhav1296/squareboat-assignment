const mongoose = require('mongoose')
const {Schema} = mongoose


const userSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    gender:{
        type:String,
        enum:['male','female','lgbtq']
    },
    age:{
        type:Number,
        required:true
    },
    token:{
        type:String,
        default:null
    },
    followers:[String]

},{
    timestamps:true
})


const User = mongoose.model('User', userSchema)
module.exports = User
