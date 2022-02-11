const { SquareboatError } = require("./squareboatEror")
const emailValidator = require('email-validator')

const isNullOrUndefined = (data)=>{
    if(data===null || data===undefined){
        return true
    }
    return false
}

const isEmailValid = data =>{
    if(emailValidator.validate(data)){
        return true
    }
    return false
}

const isSquareboatError = err=>{
    return err instanceof SquareboatError
}

const isString = data=>{
    return typeof data === 'string'
}

const isPasswordValid = data=>{
    return (data.length >=8 && data.length <= 15)
}

const isNumber = data=>{
    return typeof data === 'number'
}




module.exports={
    isNullOrUndefined,
    isSquareboatError,
    isEmailValid,
    isString,
    isPasswordValid,
    isNumber
}