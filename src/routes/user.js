const express = require("express");
const User = require("../models/user");

const userRouter = express.Router();

// Get User By Email
userRouter.get("/user", async (req, res) => {
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
userRouter.get("/feed", async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (err) {
    res.status(400).send("Something went wrong !!");
  }
});

userRouter.delete("/user", async (req, res) => {
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

userRouter.patch("/user/:userId", async (req, res) => {
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

module.exports = userRouter;
