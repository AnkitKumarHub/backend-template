import Joi from 'joi';
import mongoose, { Types } from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    // name: String OR

    name: {
      type: String,
      trim: true,
      minlength: 2,
      maxlength: 50,
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
      type: Boolean,
      default: false,
    },
    verificationToken: { type: String, select: false }, //The select: false option means that this field will not be included in query results by default, enhancing security by preventing the token from being exposed when fetching user data.
    // pura yeh model se jb new object which means new user to ye saara data return hota hai to isme se verificationToken field by default return nahi hoga, unless explicitly specified in the query. This is a common practice to protect sensitive information like verification tokens from being exposed unintentionally when retrieving user data from the database.
    refreshToken: { type: String, select: false },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); //running hook only when 'password' field gets modified dont want that if we modify isVerfied then also already hashed password should go for one more round of hashing
  this.password = await bcrypt.hash(this.password, 12); //12 is salt rounds, determines the computational cost of hashing the password higher number => more security but also more time to hash 12 common choice
  next();
});


// Define a custom instance method called 'comparePassword' on the userSchema
// This method will be available on every User document retrieved from the database
userSchema.methods.comparePassword = async function (clearTextPassword) {
  return bcrypt.compare(clearTextPassword, this.password); //return boolean
};

export default mongoose.model("User", userSchema); // here we are creating a model named "User" using the userSchema defined above This model will be used to interact with the "users" collection in the MongoDB database

// "users" is the name of the collection in the MongoDB database where user documents will be stored. By default, Mongoose will pluralize the model name to determine the collection name, so "User" becomes "users".
