const express = require("express");
const { validateSignUpData } = require("../utils/validation");
const bcrypt = require("bcrypt");
const User = require("../models/user");

const authRouter = express.Router();

// app.use() is same as authRouter.use(). Express manages both
authRouter.post("/signup", async (req, res) => {
  const { firstName, lastName, emailId, password, gender, age, skills} = req.body;
  try {
    // validate the data first
    validateSignUpData(req);
    /*Either use this validation function or use Schema validation* */

    // Encrypt the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Save the user
    const userObj = req.body;
    // Creating a new instance of the User Modal OR Creating a new User
    const user = new User({
      firstName,
      lastName,
      emailId,
      gender,
      age,
      skills,
      password: passwordHash,
    });
    await user.save();
    res.status(201).send("User Created Successfully !!");
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    const user = await User.findOne({ emailId: emailId }); // async task
    if (!user) {
      throw new Error("Invalid Credentials");
    }
    const isPasswordValid = await user.validatePassword(password);

    if (isPasswordValid) {
      // Create a JWT Token
      const token = await user.getJWT(); // whole token logic transferred to User schema object
      // Add the token to the cookie and send it to the user
      res.cookie("token", token, {
        httpOnly: true, // can't be accessed with JS
        // secure: true, // only sent over HTTPS // to be used in Production
        sameSite: "strict", // CSRF protection
        expires: new Date(Date.now() + 8 * 3600000),
      });
      res.send("Login successfull !");
    } else {
      throw new Error("Invalid Credentials");
    }
  } catch (err) {
    res.status(400).send("ERROR :" + err.message);
  }
});

authRouter.post("/logout", async (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()), // Setting token to null and Expiring the cookie right away
  });
  res.send("Logout Successfull !!");
});

module.exports = authRouter;
