const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

const requestRouter = express.Router();

requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.loggedInUser._id; // the id of the logged in user
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      const allowedStatus = ["ignored", "interested"];

      // Some validations have been moved to schema

      if (!allowedStatus.includes(status)) {
        return res
          .status(400)
          .json({ message: "Invalid Status Type :" + status });
      }
      // Checking if the user, to whom I am sending the request exists in the DB or not.
      // Keeping it secure from outside attacks.
      const toUser = await User.findById(toUserId);
      if (!toUser) {
        return res.status(400).json({ message: "User not found" });
      }

      // Check if there is an existing connection request
      const existingConnectionRequest = await ConnectionRequest.findOne({
        $or: [
          // OR logic
          { fromUserId, toUserId }, // request from Person A to Person B
          { fromUserId: toUserId, toUserId: fromUserId }, // request from Person B to Person A
        ],
      });

      /**The whole point is that if A has send request to B, then A cannot send request to B again.
       * Also, B as well cannot send request to A
       */

      if (existingConnectionRequest) {
        return res
          .status(400)
          .send({ message: "Connection Request Already Exists" });
      }

      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      const data = await connectionRequest.save();

      res.status(200).json({
        message: `${req.loggedInUser.firstName} is ${status} in ${toUser.firstName }`,
        data,
      });
    } catch (err) {
      res.status(400).send("ERROR: " + err.message);
    }
  }
);

module.exports = requestRouter;
