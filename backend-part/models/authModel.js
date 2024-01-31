const mongoose = require('mongoose');


const UserSchema = mongoose.Schema({
    name: {
        type: String,
        require: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        immutable: true,
    },
   
    password: {
        type: String,
        required: true,
        minlength: 8
    }
});

module.exports = new mongoose.model('UserModel', UserSchema);

