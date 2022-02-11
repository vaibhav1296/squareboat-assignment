const utility = require('../config/utility')
const { squareboatError } = require('../config/squareboatEror')
const { errorCodes } = require('../config/config')
const jwt = require('jsonwebtoken')
const query = require('../queries/query')


const validateRegisterApi = async (req, res, next)=>{
    try{
        const {name, email, password, gender, age} = req.body
        if(utility.isNullOrUndefined(name)){
            throw squareboatError('Provide a name', errorCodes.EMPTY_FIELD)
        }
        if(!utility.isString(name)){
            throw squareboatError('Invalid value in name field', errorCodes.INVALID_PARAM)
        }
        if(utility.isNullOrUndefined(email)){
            throw squareboatError('Provide an email', errorCodes.EMPTY_FIELD)
        }
        if(!utility.isEmailValid(email)){
            throw squareboatError('Provided email is not valid', errorCodes.INVALID_PARAM)
        }
        if(utility.isNullOrUndefined(password)){
            throw squareboatError('Provide a password', errorCodes.EMPTY_FIELD)
        }
        //length of the password should be between 8 to 15
        if(!utility.isPasswordValid(password)){
            throw squareboatError('Password length should be between 8 to 15 characters', errorCodes.PASSWORD)
        }
        if(utility.isNullOrUndefined(gender)){
            throw squareboatError('Provide a gender', errorCodes.EMPTY_FIELD)
        }
        if(utility.isNullOrUndefined(age)){
            throw squareboatError('Provide an age', errorCodes.EMPTY_FIELD)
        }
        if(!utility.isNumber(age)){
            throw squareboatError('Age is not valid', errorCodes.INVALID_PARAM)
        }
        next()
    }catch(err){
        next(err)
    }
}

const validateLoginRequest = async (req, res, next)=>{
    try{
        const {email, password} = req.body
        if(utility.isNullOrUndefined(email)){
            throw squareboatError('Provide an email', errorCodes.EMPTY_FIELD)
        }
        if(!utility.isEmailValid(email)){
            throw squareboatError('Provided email is not valid', errorCodes.INVALID_PARAM)
        }
        if(utility.isNullOrUndefined(password)){
            throw squareboatError('Provide a password', errorCodes.EMPTY_FIELD)
        }
        next()
    }catch(err){
        next(err)
    }
}

const isLoggedIn = async (req, res, next)=>{
    try{
        const header = req.headers['authorization']
        if(utility.isNullOrUndefined(header)){
            throw squareboatError('Please login', errorCodes.LOG_IN)
        }
        const token = header.split(" ")[1]
        console.log(process.env.JWT_SECRET)
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        console.log(decoded)
        const userId = decoded.userId
        const user = await query.getUserById(userId)
        if(utility.isNullOrUndefined(user)){
            throw squareboatError('Please login', errorCodes.LOG_IN)
        }
        if(token !== user.token){
            throw squareboatError('Please login', errorCodes.LOG_IN)
        }
        next()

    }catch(err){
        console.log(err)
        next(err)
    }
}

const validateCreatePostRequest = async (req, res, next)=>{
    try{
        const {title, description} = req.body
        if(utility.isNullOrUndefined(title)){
            throw squareboatError("provide a title", errorCodes.EMPTY_FIELD)
        }
        if(utility.isNullOrUndefined(description)){
            throw squareboatError('Provide a description', errorCodes.EMPTY_FIELD)
        }
        next()
    }catch(err){
        next(err)
    }
}

module.exports = {
    validateRegisterApi,
    validateLoginRequest,
    isLoggedIn,
    validateCreatePostRequest
    
}

