const express = require('express')
require('./db/mongose')

const userRouter = require('./routers/userRoute')
const tasksRouter = require('./routers/taskRouter')

var PORT = process.env.PORT 
var app = express();

app.use(express.json())
app.use(userRouter)
app.use(tasksRouter)

app.listen(PORT, () => {
    console.log("Listening at PORT  : " + PORT)
})
