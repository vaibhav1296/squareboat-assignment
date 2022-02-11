require('dotenv').config()
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const userController = require('./controllers/userController')

app.use(express.json());
app.use(express.urlencoded({extended:true}))

const requestResponseHandler = require('./services/requestResponseHandler')

const dbUrl = process.env.DB_URI

app.use('/user', userController)

app.use(requestResponseHandler.handleResponse)
app.use(requestResponseHandler.handleError)
mongoose.connect(dbUrl)
.then(()=>app.listen(process.env.PORT,()=>{
    console.log('App is running on port 3000')
}))
.catch(err=> {
    console.log('error in connecting database ', err)
})