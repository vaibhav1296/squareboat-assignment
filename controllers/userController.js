const express = require('express')
const router = express.Router()
const utility = require('../config/utility')
const config = require('../config/config')
const validation = require('../services/validation')
const query = require('../queries/query')
const { squareboatError } = require('../config/squareboatEror')
const { errorCodes } = require('../config/config')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

router.post('/register', validation.validateRegisterApi, async (req, res, next)=>{
    try{
        const {name, email, password, gender, age} = req.body
        //find if a user already exists with this email
        const user = await query.getUserByEmail(email)
        if(!utility.isNullOrUndefined(user)){
            throw squareboatError('A user already exists with this email', errorCodes.DB_QUERY)
        }
        const hashedPassword = bcrypt.hashSync(password, 6);
        const newUser = await query.createANewUser({name,email,password:hashedPassword,age,gender})
        if(utility.isNullOrUndefined(newUser)){
            throw squareboatError('Something went wrong while registering', errorCodes.DB_QUERY)
        }
        //user created successfully
        newUser._id = newUser._id.toString()
        const userId = newUser._id.toString()
        const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
            expiresIn: 86400,
          });
        if(utility.isNullOrUndefined(token)){
            throw squareboatError('Soemthing went wrong while genereting login token', errorCodes.JWT)
        }
        const tokenUpdated = await query.updateUserToken(email, token)
        if(utility.isNullOrUndefined(tokenUpdated) || !tokenUpdated.acknowledged){
            throw squareboatError('Something went wrong while token saving', errorCodes.DB_QUERY)
        }
        res.locals.response = {
            body:{
                data:{
                    id:newUser._id,
                    name:newUser.name,
                    email:newUser.email,
                    token
                }
            },
            message:"The user has been successfully registered"
        }
        
        next()
    }catch(err){
        next(err)
    }
})

router.post('/login', validation.validateLoginRequest, async (req, res, next)=>{
    try{
        //login request
        const {email, password} = req.body
        //get user with this email
        const userFromDb = await query.getUserByEmail(email)
        if(utility.isNullOrUndefined(userFromDb)){
            throw squareboatError('User is not registered', errorCodes.NOT_IN_DB)
        }
        const hashedPassword = userFromDb.password
        const passwordValid = bcrypt.compareSync(password, hashedPassword)
        if(!passwordValid){
            throw squareboatError('Incorrect passowrd', errorCodes.INVALID_PARAM)
        }
        const userId = userFromDb._id.toString()
        //generate a token
        const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
            expiresIn: 86400,
          });
        const tokenUpdated = await query.updateUserToken(email, token)
        if(utility.isNullOrUndefined(tokenUpdated) || !tokenUpdated.acknowledged){
            throw squareboatError('Something went wrong while token saving', errorCodes.DB_QUERY)
        }
        res.locals.response = {
            body:{
                data:{
                    email,
                    token
                }
            },
            message:'The user has been logged in successfully'
        }
        next()


    }catch(err){
        next(err)
    }
})

router.get('/all', validation.isLoggedIn, async (req, res, next)=>{
    // retrieve all the users
    try{
        let users = await query.getAllUsers()
        if(users.length < 1){
            res.locals.response = {
                body:{
                    data:[]
                },
                message:'No users on this application'
            }
        }else{
            let usersList = users.map(data=>{
                return {
                    id:data._id.toString(),
                    name:data.name,
                }
            })
            res.locals.response = {
                body:{
                    data:usersList
                },
                message:'List of all users'
            }
            next()
        }
    }catch(err){
        console.log(err)
        next(err)
    }
})

router.get('/profile', validation.isLoggedIn, async (req, res, next)=>{
    try {
        const {userId} = jwt.verify(req.headers['authorization'].split(" ")[1], process.env.JWT_SECRET)
        let user = await query.getUserById(userId)
        if(utility.isNullOrUndefined(user)){
            throw squareboatError('No user', errorCodes.DB_QUERY)
        }
        const followers = user.followers
        let allFollowers = await query.getAllFollwers(followers)
        if(allFollowers.length > 0){
            allFollowers = allFollowers.map(data=>{
                return {
                    id:data._id.toString(),
                    name:data.name,
                    email:data.email
                }
            })
        }
        user = {
            id:user._id.toString(),
            name:user.name,
            email:user.email,
            gender:user.gender,
            age:user.age

        }
        let allPosts = await query.getAllPosts(userId)
        res.locals.response = {
            body:{
                data:{
                    user,
                    allFollowers,
                    allPosts
                }
            },
            message:"User profile info"
        }
        next()
    } catch (err) {
        next(err)
    }
})

router.get('/profile/:id', validation.isLoggedIn, async (req, res, next)=>{
    try{
        
        const currentUserId = req.query.userId
        if(utility.isNullOrUndefined(currentUserId)){
            throw squareboatError('Invalid query params', errorCodes.INVALID_PARAM)
        }
        const id = req.params.id
        if(utility.isNullOrUndefined(id)){
            throw squareboatError("please provide an ID", errorCodes.EMPTY_FIELD)
        }
        let user = await query.getUserById(id)
        user = {
            name:user.name,
            email:user.email,
            id:user._id.toString(),
            gender:user.gender,
            age:user.age
        }
        // first check if you follow this
        const currentUser = await query.getUserById(currentUserId)
        if(!utility.isNullOrUndefined(currentUser)){
            const currentUserFollowers = currentUser.followers
            if(!currentUserFollowers.includes(id)){
                res.locals.response = {
                    body:{
                        data:user
                    },
                    message:'Details of requested user'
                }
                next()
            }else{
                const posts = await query.getAllPosts(id)
                res.locals.response = {
                    body:{
                        data:{...user, posts}
                    },
                    message:'Details of requested user'
                }
                next()
            }    
        }
        
        
    }catch(err){
        console.log(err)
        next(err)
    }
})

router.put('/follow/:id', validation.isLoggedIn, async (req, res, next)=>{
    try{
        const id = req.params.id
        const currentUserId = req.query.userId
        if(utility.isNullOrUndefined(id)){
            throw squareboatError('Please provide an ID', errorCodes.EMPTY_FIELD)
        }
        const user = await query.getUserById(id)
        if(utility.isNullOrUndefined(user)){
            throw squareboatError('No user exists', errorCodes.NOT_IN_DB)
        }
        const userId = user._id
        const updatedUser = await query.addFollower(currentUserId, id)
        if(utility.isNullOrUndefined(updatedUser)){
            throw squareboatError('Can not add follower', errorCodes.DB_QUERY)
        }
        res.locals.response = {
            body:{
                data:true
            },
            message:"Your are following this user"
        }
        next()
    }catch(err){
        console.log(err)
        next(err)
    }
})

router.post('/post', validation.isLoggedIn, validation.validateCreatePostRequest, async (req, res, next)=>{
    try{
        const {title, description} = req.body
        const {userId} = await jwt.verify(req.headers['authorization'].split(" ")[1], process.env.JWT_SECRET)
        let newPost = await query.createAPost({title, description, user_id:userId})
        if(utility.isNullOrUndefined(newPost)){
            throw squareboatError('Something went wrong while creating a post', errorCodes.DB_QUERY)
        }
        newPost = {
            title:newPost.title,
            description:newPost.description,
            likes:newPost.likes
        }
        res.locals.response={
            body:{
                data:newPost
            },
            message:"You created a post"
        }
        next()
    }catch(err){
        next(err)
    }
})

router.post('/like/:id', validation.isLoggedIn, async (req, res, next)=>{
    try{
        const id = req.params.id
        if(utility.isNullOrUndefined(id)){
            throw squareboatError('PLease provide an ID', errorCodes.EMPTY_FIELD)
        }
        const {userId} = jwt.verify(req.headers['authorization'].split(" ")[1],process.env.JWT_SECRET)
        const updatedPost = await query.addLikeOnPost(id, userId)
        if(utility.isNullOrUndefined(updatedPost)){
            throw squareboatError('Something went wrong', errorCodes.DB_QUERY)
        }
        res.locals.response = {
            body:{
                data:true
            },
            message:"like added"
        }
        next()
    }catch(err){
        console.log(err)
        next(err)
    }
})

router.delete('/logout', async (req, res, next)=>{
    try{
        //check if there is token or not
        const header = req.headers['authorization']
        if(utility.isNullOrUndefined(header)){
            throw squareboatError('Missing authorization header', errorCodes.EMPTY_FIELD)
        }
        const {email} = req.body
        if(utility.isNullOrUndefined(email)){
            throw squareboatError('Provide a email', errorCodes.EMPTY_FIELD)
        }
        if(!utility.isEmailValid(email)){
            throw squareboatError('Invalid email', errorCodes.INVALID_PARAM)
        }
        const headerToken = header.split(" ")[1]
        const userFromDb = await query.getUserByEmail(email)
        if(utility.isNullOrUndefined(userFromDb)){
            throw squareboatError('Email does not exist', errorCodes.INVALID_PARAM)
        }
        if(headerToken === userFromDb.token){
            //update the user and put token value null
            const updatedUser = await query.deleteToken(email)
            if(utility.isNullOrUndefined(updatedUser) || !updatedUser.acknowledged){
                throw squareboatError('Unable to logout', errorCodes.DB_QUERY)
            }
            res.locals.response = {
                body:{
                    data:true
                },
                message:'User logged out successfully'
            }
        }
        next()


    }catch(err){
        next(err)
    }
})



module.exports = router