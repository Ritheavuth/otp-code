const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  verified: {
    type: Boolean,
    default: false
  },
  request_id: {
    type: String,
    default: ""
  }
});

const User = mongoose.model("User", userSchema);

module.exports = User;
