import mongoose from "mongoose";

//* 1. db connection fail hote hai koi guarantee nahi hai 
//* 2. Database is always in "another continent" -> iska mtlb DB se jb bhi baat karo await & try-catch use karo 

const connectDB = async ()=>{
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    //what is inside this connection???
    // console.log("inside the connection - ", conn);


    console.log(`MongoDb connected: ${conn.connection.host}`)

}

export default connectDB;