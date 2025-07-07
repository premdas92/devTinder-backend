const mongoose = require("mongoose");
const { Schema } = mongoose;

const connectionRequestSchema = new Schema(
  {
    fromUserId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    toUserId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ["ignore", "interested", "accepted", "rejected"],
        message: `{VALUE} is incorrect status type`,
      },
    },
  },
  {
    timestamps: true,
  }
);

// ConnectionRequest.find({fromUserId: "24324", toUserId: "45353"}) <----After indexing this will be very fast
connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 });

// this will be called just before the api.save().
connectionRequestSchema.pre("save", function (next) {
  const connectionRequest = this;

  // Check if fromUserId is same as toUserId --> Person A cannot send request to himself
  if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
    throw new Error("Cannot send connection request to yourself");
  }
  next();
});

const ConnectionRequest = new mongoose.model(
  "ConnectionRequest",
  connectionRequestSchema
);
module.exports = ConnectionRequest;
