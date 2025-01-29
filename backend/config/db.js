const mongoose = require("mongoose");

const connectDb = async () =>{
    try{
        const connect = await mongoose.connect(process.env.CONNECTION_STRING)
        console.log("Connected to database:", connect.connection.host, connect.connection.name)
    }
    catch(err) {
        console.log(err);
        process.exit;
    }
}

module.exports = connectDb

