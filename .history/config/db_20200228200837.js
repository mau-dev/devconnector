const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI');

//connecting to mongodb, passing the db value, this is giving a promise 
//asynchronous function
const connectDB = async () => {
    try {
        //returns a promise
        await mongoose.connect(db, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useUnifiedTopology: true
        });

        console.log('MongoDB Connected!!!');
    } catch (err) {
        console.log(err.message);
        // Exit process with failure
        process.exit(1);
    }
}

module.exports = connectDB;