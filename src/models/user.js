const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
  },
  verified: {
    type: Boolean,
    default: false
  },

  otp : {
    type: String,
    
  }

});

const User = mongoose.model("User", userSchema);

module.exports = User;
