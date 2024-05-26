const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const db = require('./db');
require('dotenv').config();

app.use(bodyParser.json());
PORT = process.env.PORT||3000;
const userRouter = require('./Routes/userRoutes');

app.use('/user',userRouter);
app.listen(PORT,()=>{
    console.log("listening to port 3000");
})