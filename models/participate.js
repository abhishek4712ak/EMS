import mongoose from "mongoose";


const userModel = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role : {
        type: String,
        default: "user"
    },
    otp: {
        type: String,
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    otpExpiresAt: {
        type: String,
    }

}, { timestamps: true });




const participate = mongoose.model("Participate", userModel);

export default participate;