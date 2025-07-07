const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 4,
      maxLength: 50,
    },
    lastName: {
      type: String,
    },
    emailId: {
      type: String,
      required: true,
      unique: true, // automatically creates an Index
      trim: true,
      lowercase: true,
      validate(value) {
        console.log(validator.isEmail(value));
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email address: " + value);
        }
      },
    },
    password: {
      type: String,
      required: true,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error("Enter a Strong Password " + value);
        }
      },
    },
    age: {
      type: Number,
      min: 18,
    },
    gender: {
      type: String,
      enum: {
        values: ["male", "female", "other"],
        message: `{VALUE} is not a valid gender type`
      }
    /*  OR
    validate(value) {
        // Validate method gets fired only in case of new creation and not is case of update(patch)
        if (!["male", "female", "others"].includes(value)) {
          throw new Error("Gender data is not valid");
        }
      },*/
    },
    photoUrl: {
      type: String,
      default: "https://geographyandyou.com/images/user-profile.png",
      validate(value){
        if(!validator.isURL(value)){
          throw new Error("Invalid Photo URL: " + value)
        }
      }
    },
    about: {
      type: String,
      default: "This is a default about of the user !",
    },
    skills: {
      type: ['String']
    }
  },
  {
    timestamps: true, // gives createdAt and updatedAt
  }
);

userSchema.methods.getJWT = async function () {
  // DO NOT use Arrow fn; context of this will be lost
  const user = this;
  const token = await jwt.sign({ _id: user._id }, "DEV@TINDER$007", {
    expiresIn: "7d",
  });
  return token;
};

userSchema.methods.validatePassword = async function (passwordInputByUser) {
  const user = this;
  const passwordHash = user.password;
  const isPasswordValid = await bcrypt.compare(
    passwordInputByUser,
    passwordHash
  );

  return isPasswordValid;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
