const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://premdas92:u26oTHHN6fzava8I@namastenodecluster.ila2jjj.mongodb.net/devTinderDB"
  );
};

  module.exports = connectDB;
