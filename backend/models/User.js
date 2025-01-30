const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Please enter username"],
    },
    email: {
      type: String,
      required: [true, "Enter Email Address"],
      unique: [true, "Email address already registered!"],
    },
    password: {
      type: String,
      required: [true, "Enter password"],
    },
    storageUsed: {
      type: Number, 
      default: 0.0, 
    },
  },
  {
    timestamps: true,
  }
);

// Use existing model if it exists, otherwise create a new one
const User = mongoose.models.User || mongoose.model("User", userSchema);

module.exports = User;
  