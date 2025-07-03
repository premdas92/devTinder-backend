const express = require("express");
const connectDB = require("./config/databse");
const User = require("./models/user");
const { validateSignUpData } = require("./utils/validation");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { userAuth } = require("./middlewares/auth");

const app = express();

app.use(express.json()); // This is a middleware to read the data. We cant read the 'req' object
app.use(cookieParser());

app.post("/signup", async (req, res) => {
  const { firstName, lastName, emailId, password, gender } = req.body;
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
      password: passwordHash,
    });
    await user.save();
    res.status(201).send("User Created Successfully !!");
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

app.post("/login", async (req, res) => {
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

app.get("/profile", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.loggedInUser;
    res.status(200).send(loggedInUser);
  } catch (err) {
    res.status(400).send("ERROR :" + err.message);
  }
});

// Get User By Email
app.get("/user", async (req, res) => {
  const userEmail = req.body.emailId;
  // const users = await User.find({emailId: userEmail}); // Array of users
  try {
    const user = await User.findOne({ emailId: userEmail });
    if (!user) {
      res.status(404).send("user not found");
    } else {
      res.send(user);
    }
  } catch (err) {
    res.status(400).send("Something went wrong");
  }
});

// Feed API - GET /feed - get all users from the databse
app.get("/feed", async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (err) {
    res.status(400).send("Something went wrong !!");
  }
});

app.delete("/user", async (req, res) => {
  const userId = req.body.userId;
  try {
    const user = await User.findByIdAndDelete(userId);
    // OR
    // const user = await User.findByIdAndDelete(_id: userId);
    res.status(200).send("User deleted successfully");
  } catch (err) {
    res.status(400).send("Something went wrong !!");
  }
});

app.patch("/user/:userId", async (req, res) => {
  const userId = req.params?.userId;
  const data = req.body;

  const ALLOWED_UPDATES = ["gender", "password", "lastName"];

  try {
    const isUpdateAllowed = Object.keys(data).every((k) =>
      ALLOWED_UPDATES.includes(k)
    );

    if (!isUpdateAllowed) {
      throw new Error("Update Not Allowed");
    }
    await User.findByIdAndUpdate({ _id: userId }, data, {
      returnDocument: "after", // returns the changed data (default is before, which returns the old object before the update took place)
      runValidators: true, // this is needed of we want to run the validate() method to work in case of update
    });
    res.send("User updated successfully");
  } catch (err) {
    res.status(400).send("Update Failed: " + err.message);
  }
});

connectDB()
  .then(() => {
    console.log("Database connection established...");
    app.listen(7777, () => {
      console.log("Server is successfully listening on port 7777");
    });
  })
  .catch((err) => {
    console.error("Couldn't connect to the Database !!");
  });
