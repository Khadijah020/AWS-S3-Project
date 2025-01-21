const mongoose = require("mongoose")

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: [true, "Please enter username"],
    },
    email: {
        type: String,
        required: [true, "Enter Email Address"],
        unique: [true, "Email address already registered!"]
    },
    password: {
        type: String,
        required: [true, "Enter password"],
    },

}, {
    timestamps: true,
})

module.exports = mongoose.model("User", userSchema)