class SquareboatError extends Error{
    constructor(message, statusCode){
        super(message)
        this.statusCode = statusCode || 500
    }
}

const squareboatError = (message, statusCode)=>{
    return new SquareboatError(message, statusCode)

}

module.exports = {
    SquareboatError,
    squareboatError
}