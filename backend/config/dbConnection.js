    const mongoose = require("mongoose");

    const connectDb = async()=>{
        try{
            const MONGO_URI = process.env.MONGO_URI;
            mongoose.connect(
              MONGO_URI,
              {
                user: process.env.MONGO_USER,
                pass: process.env.MONGO_PASSWORD,
              }
            )
            console.log("Database connected")
            // console.log("Database connected:",process.env.DB_NAME)
        }catch(err){
            console.error("Database connection error:", err);
            console.log("Attempting to connect to database at:", process.env.MONGO_URI);

            process.exit(1);
        }
    };

    module.exports = connectDb;
