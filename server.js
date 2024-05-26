const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const db = require('./db');
require('dotenv').config();

app.use(bodyParser.json());
PORT = process.env.PORT||3000;

const {jwtMiddleware} = require('./jwt')

const userRouter = require('./Routes/userRoutes');
const candidateRouter = require('./Routes/candidateRoutes');

app.use('/user',userRouter);
app.use('/candidate',candidateRouter);
app.listen(PORT,()=>{
    console.log("listening to port 3000");
})