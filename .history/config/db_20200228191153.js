const mongoose = require('mongoose');
const config = require('config');
//getting the mogoURI 
const db = config.get('mongoURI');

//connecting to mongodb, passing the db value, this is giving a promise 
//asynchronous function
const connectDB = async () => {
    try {
        //trihs returns a poromise
        await mongoose.connect(db, {
            useNewUrlParser: true
        });

        console.log('MongoDB Connected..');
    } catch (err) {
        console.log(err.message);
        //exit process with failure
        process.exit(1);
    };
}

module.exports = connectDB;