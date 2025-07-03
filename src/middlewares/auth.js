const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    // Get the token
    const { token } = req.cookies;
    if (!token) throw new Error("Token is not valid");
    // Validate the token
    const decodedObj = await jwt.verify(token, "DEV@TINDER$007");
    const { _id } = decodedObj; // we will get the id of the logged in user, because thid id was sent while creating the JWT token
    // Get the Logged In User from the token
    const loggedInUser = await User.findById(_id);
    if (!loggedInUser) {
      throw new Error("User not found");
    }
    /*We are finding the user in the /profile also. But why to duplicate it. 
    So attaching the logged in user details with the re object* */
    req.loggedInUser = loggedInUser;
    next();
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
};

module.exports = { userAuth };
