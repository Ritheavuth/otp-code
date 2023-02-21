const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  otp: {
    code: {
      type: String,
      default: null,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
  },
});

userSchema.methods.generateOtp = function () {
  // Generate a random 6-digit OTP code
  const otpCode = Math.floor(100000 + Math.random() * 900000);

  // Store the OTP code and expiry time in the user object
  this.otp = {
    code: otpCode,
    attempts: 0,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000), // expires in 5 minutes
  };

  return otpCode;
};

userSchema.methods.verifyOtp = function (otpCode) {
  // Check if OTP code matches and has not expired
  if (this.otp.code === otpCode && this.otp.expiresAt > Date.now()) {
    // Reset the OTP code
    this.otp.code = null;
    this.otp.attempts = 0;
    this.otp.expiresAt = null;
    return true;
  } else {
    // Increment the number of failed attempts
    this.otp.attempts++;
    return false;
  }
};

const User = mongoose.model("User", userSchema);

module.exports = User;
