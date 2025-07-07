const express = require("express");
const connectDB = require("./config/databse");
const cookieParser = require("cookie-parser");

const app = express();

app.use(express.json()); // This is a middleware to read the data. We cant read the 'req' object
app.use(cookieParser());

// Importing all routes
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");

app.use("/", authRouter); // now using route as a middleware
app.use("/", profileRouter); 
app.use("/", requestRouter); 
app.use("/", userRouter); 

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
