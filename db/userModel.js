const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    email : {
        type : String,
        required : [true, "Please provide an email!"],
        unique : [true, "Email already exists"]
    },
    password : {
        type : String, 
        require : [true, "Please provide a password"]
    }
})

// Use the singular form "User" for the model name
module.exports = mongoose.model("User", userSchema)