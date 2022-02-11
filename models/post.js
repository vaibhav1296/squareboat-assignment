const mongoose = require('mongoose')
const {Schema}  = mongoose


const postSchema = new Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    likes:[String],
    user_id:{
        type:String,
        required:true
    }
},{
    timestamps:true
})


const Post = mongoose.model('Post', postSchema)
module.exports = Post