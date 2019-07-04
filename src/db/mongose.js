const mongoose = require('mongoose')
mongoose.connect(process.env.MongoDB_URI,{
    useNewUrlParser:true,
    useCreateIndex:true
})
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);



