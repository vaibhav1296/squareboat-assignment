const User = require('../models/user')
const Post = require('../models/post')
const utility = require('../config/utility')

class Query {
    getUserByEmail(email){
        return new Promise((resolve, reject)=>{
            User.findOne({
                email
            })
            .lean()
            .then(data=>{
                resolve(data)
            })
            .catch(err=>{
                reject(err)
            })
        })
    }
    getUserById(id){
        return new Promise((resolve, reject)=>{
            User.findOne({_id:id})
            .lean()
            .then(data=> resolve(data))
            .catch(err=> reject(err))
        })
    }
    createANewUser({name,email,password,age,gender}){
        const user = new User({
            name,
            email,
            password,
            age,
            gender
        })
        return new Promise((resolve, reject)=>{
            user.save()
            .then(data=>{
                resolve(data)
            })
            .catch(err=>{
                reject(err)
            })
        })
    }
    updateUserToken(email, token){
        return new Promise((resolve, reject)=>{
            User.updateOne({
                email
            },{
                token
            })
            .then(data=>{
                resolve(data)
            })
            .catch(err=>{
                reject(err)
            })
        })
    }
    deleteToken(id){
        return new Promise((resolve, reject)=>{
            User.updateOne({
                _id:id
            },{
                token:null
            })
            .then(data=>{
                resolve(data)
            })
            .catch(err=>{
                reject(err)
            })
        })
    }
    getAllUsers(){
        return new Promise((resolve, reject)=>{
            User.find()
            .lean()
            .then(data=> resolve(data))
            .catch(err=> reject(err))
        })
    }
    addFollower(id, userId){
        return new Promise((resolve, reject)=>{
            User.updateOne({
                "_id":id
            },{
                "$push":{
                    "followers":userId
                }
            })
            .then(data=> resolve(data))
            .catch(err=> reject(err))
        })
    }
    getAllPosts(id){
        return new Promise((resolve, reject)=>{
            Post.find({
                user_id:id
            })
            .lean()
            .then(data=> resolve(data))
            .catch(err=> reject(err))
        })
    }
    createAPost({title, description, user_id}){
        const post = new Post({
            title,
            description,
            likes:[],
            user_id
        })
        return new Promise((resolve, reject)=>{
            post.save()
            .then(data=> resolve(data))
            .catch(err=> reject(err))
        })
    }
    addLikeOnPost(id, userId){
        return new Promise((resolve, reject)=>{
            Post.updateOne({
                "_id":id
            },{
                "$push":{
                    likes:userId
                }
            })
            .then(data=> resolve(data))
            .catch(err=> reject(err))
        })
    }
    getPostById(id){
        return new Promise((resolve, reject)=>{
            Post.findOne({
                _id:id
            })
            .lean()
            .then(data=> resolve(data))
            .catch(err=> reject(err))
        })
    }

    getAllFollwers(followers){
        return new Promise((resolve, reject)=>{
            User.find({
                _id:{
                    "$in":followers
                }
            })
            .lean()
            .then(data=> resolve(data))
            .catch(err=> reject(err))
        })
    }

    getFeed(userIds){
            return new Promise((resolve, reject)=>{
                Post.find({
                    user_id:{
                        "$in":userIds
                    }
                })
                .lean()
                .then(data=>{
                    resolve(data)
                })
                .catch(err=> reject(err))
            })
    }

}

const query = new Query()
module.exports = query