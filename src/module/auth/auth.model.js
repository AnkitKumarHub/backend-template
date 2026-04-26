import { string } from "joi";
import mongoose, { Types } from "mongoose";

//
const userSchema = new mongoose.Schema(
  {
    // name: String OR

    name: {
      type: String,
      trim: true,
      minlength: 2,
      maxlenght: 50,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      trim: true,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8,
      select: false, // this means that when we query the user data from the database, the password field will not be included in the results by default. This is a security measure to prevent the password from being exposed when fetching user data. If you want to include the password in a query, you would need to explicitly specify it in the query options.
      //we know;
    },
    role: {
      type: String,
      enum: ["customer", "seller", "admin"], // kahi baar enum ke andar jo value aayegi wo constant naam file se aayegi via map
      default: "customer",
    },
    isVerified: {
      type: boolean,
      default: false,
    },
    verificationToken: { type: String, select: false }, //The select: false option means that this field will not be included in query results by default, enhancing security by preventing the token from being exposed when fetching user data.
    // pura yeh model se jb new object which means new user to ye saara data return hota hai to isme se verificationToken field by default return nahi hoga, unless explicitly specified in the query. This is a common practice to protect sensitive information like verification tokens from being exposed unintentionally when retrieving user data from the database.
    refreshtoken: { type: String, select: false },
    resetPasswordtoken: { type: String, select: false },
    resetpasswordExpires: { type: Date, select: false },
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema); // here we are creating a model named "User" using the userSchema defined above This model will be used to interact with the "users" collection in the MongoDB database

// "users" is the name of the collection in the MongoDB database where user documents will be stored. By default, Mongoose will pluralize the model name to determine the collection name, so "User" becomes "users".
